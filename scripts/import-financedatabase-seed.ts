import "dotenv/config";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "../app/_lib/supabase/database.types";
import {
	buildImportDataset,
	combineImportDatasets,
	FINANCEDATABASE_DATASETS,
	FINANCEDATABASE_LICENSE_NOTE,
	FINANCEDATABASE_REVISION,
	FINANCEDATABASE_SOURCE,
	type ImportDataset,
	summarizeCounts,
	type VerificationCount,
} from "./financedatabase-seed";

type Supabase = SupabaseClient<Database>;
type SecuritiesMasterInsert =
	Database["public"]["Tables"]["securities_master"]["Insert"];
type SecurityAliasInsert =
	Database["public"]["Tables"]["security_aliases"]["Insert"];

type RunMode = "import" | "dry-run" | "verify";

const envSchema = z.object({
	SUPABASE_URL: z.string().url(),
	SUPABASE_SECRET_KEY: z.string().min(16, "must be at least 16 characters"),
});

const mode = parseMode(process.argv.slice(2));

async function main(): Promise<void> {
	if (mode === "verify") {
		const supabase = createServiceClient();
		const counts = await fetchRemoteCounts(supabase);
		const aliasCounts = await fetchRemoteAliasCounts(supabase);
		const latestRun = await fetchLatestSourceRun(supabase);

		printCounts("Remote securities_master counts", counts);
		printAliasCounts(aliasCounts);
		printLatestRun(latestRun);
		return;
	}

	const importedAt = new Date().toISOString();
	const dataset = await fetchImportDataset(importedAt);
	printImportSummary(dataset);
	printCounts("Selected import counts", summarizeCounts(dataset.securities));

	if (mode === "dry-run") {
		console.log("dry-run: no Supabase writes performed");
		return;
	}

	const supabase = createServiceClient();
	const runId = await startSourceRun(supabase);

	try {
		await upsertSecurities(supabase, dataset.securities);
		await upsertAliases(supabase, dataset.aliases);
		await finishSourceRun(supabase, runId, "ok", null);
		const counts = await fetchRemoteCounts(supabase);
		printCounts("Remote securities_master counts after import", counts);
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : "unknown import failure";
		await finishSourceRun(supabase, runId, "failed", message);
		throw error;
	}
}

async function fetchImportDataset(importedAt: string): Promise<ImportDataset> {
	const [equitiesCsv, etfsCsv] = await Promise.all([
		fetchCsv(FINANCEDATABASE_DATASETS.equities),
		fetchCsv(FINANCEDATABASE_DATASETS.etfs),
	]);

	return combineImportDatasets([
		buildImportDataset("equities", equitiesCsv, importedAt),
		buildImportDataset("etfs", etfsCsv, importedAt),
	]);
}

async function fetchCsv(sourceUrl: string): Promise<string> {
	const response = await fetch(sourceUrl);

	if (!response.ok) {
		throw new Error(
			`failed to fetch FinanceDatabase CSV: ${response.status} ${response.statusText}`,
		);
	}

	return response.text();
}

function createServiceClient(): Supabase {
	const env = envSchema.parse(process.env);

	return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
			detectSessionInUrl: false,
		},
	});
}

async function startSourceRun(supabase: Supabase): Promise<string> {
	const result = await supabase
		.from("external_source_runs")
		.insert({
			provider: FINANCEDATABASE_SOURCE,
			source_url: Object.values(FINANCEDATABASE_DATASETS).join("\n"),
			source_revision: FINANCEDATABASE_REVISION,
			status: "running",
			robots_policy:
				"GitHub raw public repository content; no scraping or robots bypass",
			license_note: FINANCEDATABASE_LICENSE_NOTE,
		})
		.select("id")
		.single();

	if (result.error) {
		throw new Error(
			`failed to record source run start: ${result.error.message}`,
		);
	}

	return result.data.id;
}

async function finishSourceRun(
	supabase: Supabase,
	runId: string,
	status: "ok" | "failed",
	err: string | null,
): Promise<void> {
	const result = await supabase
		.from("external_source_runs")
		.update({ status, err, finished_at: new Date().toISOString() })
		.eq("id", runId);

	if (result.error) {
		throw new Error(
			`failed to record source run finish: ${result.error.message}`,
		);
	}
}

async function upsertSecurities(
	supabase: Supabase,
	rows: SecuritiesMasterInsert[],
): Promise<void> {
	const batchSize = 1_000;

	for (let offset = 0; offset < rows.length; offset += batchSize) {
		const batch = rows.slice(offset, offset + batchSize);
		const result = await supabase
			.from("securities_master")
			.upsert(batch, { onConflict: "symbol" });

		if (result.error) {
			throw new Error(
				`failed to upsert securities_master: ${result.error.message}`,
			);
		}
	}
}

async function upsertAliases(
	supabase: Supabase,
	rows: SecurityAliasInsert[],
): Promise<void> {
	const batchSize = 1_000;

	for (let offset = 0; offset < rows.length; offset += batchSize) {
		const batch = rows.slice(offset, offset + batchSize);
		const result = await supabase
			.from("security_aliases")
			.upsert(batch, { onConflict: "symbol,alias,alias_type" });

		if (result.error) {
			throw new Error(
				`failed to upsert security_aliases: ${result.error.message}`,
			);
		}
	}
}

async function fetchRemoteCounts(
	supabase: Supabase,
): Promise<VerificationCount[]> {
	const rows: SecuritiesMasterInsert[] = [];
	const batchSize = 1_000;

	for (let offset = 0; ; offset += batchSize) {
		const result = await supabase
			.from("securities_master")
			.select("asset_class,country,exchange")
			.eq("source", FINANCEDATABASE_SOURCE)
			.eq("source_revision", FINANCEDATABASE_REVISION)
			.range(offset, offset + batchSize - 1);

		if (result.error) {
			throw new Error(
				`failed to verify securities_master counts: ${result.error.message}`,
			);
		}

		rows.push(
			...result.data.map((row) => ({
				symbol: "verification-row",
				name: "verification-row",
				asset_class: row.asset_class,
				country: row.country,
				currency: "N/A",
				exchange: row.exchange,
				source: FINANCEDATABASE_SOURCE,
			})),
		);

		if (result.data.length < batchSize) {
			break;
		}
	}

	return summarizeCounts(rows);
}

async function fetchRemoteAliasCounts(
	supabase: Supabase,
): Promise<Array<{ alias_type: string; count: number }>> {
	const aliasTypes = ["local_symbol", "name"];
	const counts: Array<{ alias_type: string; count: number }> = [];

	for (const aliasType of aliasTypes) {
		const result = await supabase
			.from("security_aliases")
			.select("symbol", { count: "exact", head: true })
			.eq("source", FINANCEDATABASE_SOURCE)
			.eq("alias_type", aliasType);

		if (result.error) {
			throw new Error(
				`failed to verify security_aliases counts: ${result.error.message}`,
			);
		}

		counts.push({ alias_type: aliasType, count: result.count ?? 0 });
	}

	return counts;
}

async function fetchLatestSourceRun(supabase: Supabase): Promise<{
	status: Database["public"]["Enums"]["cron_status"];
	no_error: boolean;
	source_revision: string | null;
}> {
	const result = await supabase
		.from("external_source_runs")
		.select("status,err,source_revision")
		.eq("provider", FINANCEDATABASE_SOURCE)
		.order("started_at", { ascending: false })
		.limit(1)
		.single();

	if (result.error) {
		throw new Error(
			`failed to verify external_source_runs: ${result.error.message}`,
		);
	}

	return {
		status: result.data.status,
		no_error: result.data.err === null,
		source_revision: result.data.source_revision,
	};
}

function parseMode(args: string[]): RunMode {
	if (args.includes("--verify")) {
		return "verify";
	}

	if (args.includes("--dry-run")) {
		return "dry-run";
	}

	return "import";
}

function printImportSummary(dataset: ImportDataset): void {
	console.log(`source: ${FINANCEDATABASE_SOURCE}`);
	console.log(`source_revision: ${FINANCEDATABASE_REVISION}`);
	console.log(`securities_selected: ${dataset.securities.length}`);
	console.log(`aliases_selected: ${dataset.aliases.length}`);
	console.log(`rows_skipped: ${dataset.skipped}`);
}

function printCounts(title: string, counts: VerificationCount[]): void {
	console.log(title);
	console.table(counts);
}

function printAliasCounts(
	counts: Array<{ alias_type: string; count: number }>,
): void {
	console.log("Remote security_aliases counts");
	console.table(counts);
}

function printLatestRun(run: {
	status: Database["public"]["Enums"]["cron_status"];
	no_error: boolean;
	source_revision: string | null;
}): void {
	console.log("Latest FinanceDatabase external_source_runs status");
	console.table([run]);
}

main().catch((error: unknown) => {
	const message =
		error instanceof Error
			? error.message
			: "unknown FinanceDatabase import failure";
	console.error(`failed: FinanceDatabase import - ${message}`);
	process.exitCode = 1;
});
