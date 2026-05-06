import type { Database } from "../app/_lib/supabase/database.types";

export const FINANCEDATABASE_SOURCE = "FinanceDatabase";
export const FINANCEDATABASE_REVISION = "1b81bacb9f8672491e8ef4bd4036c4e87204dbd9";
export const FINANCEDATABASE_LICENSE_NOTE =
  "FinanceDatabase by Jeroen Bouma is MIT licensed; imported rows preserve source and pinned revision metadata.";

export const FINANCEDATABASE_DATASETS = {
  equities: `https://raw.githubusercontent.com/JerBouma/FinanceDatabase/${FINANCEDATABASE_REVISION}/database/equities.csv`,
  etfs: `https://raw.githubusercontent.com/JerBouma/FinanceDatabase/${FINANCEDATABASE_REVISION}/database/etfs.csv`
} as const;

type SecuritiesMasterInsert = Database["public"]["Tables"]["securities_master"]["Insert"];
type SecurityAliasInsert = Database["public"]["Tables"]["security_aliases"]["Insert"];

type DatasetKind = keyof typeof FINANCEDATABASE_DATASETS;

type FinanceDatabaseRow = Record<string, string>;

export type ImportDataset = {
  securities: SecuritiesMasterInsert[];
  aliases: SecurityAliasInsert[];
  skipped: number;
};

export type VerificationCount = {
  asset_class: string;
  country: string;
  exchange: string;
  count: number;
};

export function parseCsv(csvText: string): FinanceDatabaseRow[] {
  const normalized = csvText.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let field = "";
  let currentRow: string[] = [];
  let quoted = false;

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const nextChar = normalized[index + 1];

    if (quoted) {
      if (char === '"' && nextChar === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      currentRow.push(field);
      field = "";
    } else if (char === "\n") {
      currentRow.push(field);
      rows.push(currentRow);
      currentRow = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || currentRow.length > 0) {
    currentRow.push(field);
    rows.push(currentRow);
  }

  const [headers, ...body] = rows;
  if (!headers || headers.length === 0) {
    return [];
  }

  return body
    .filter((row) => row.some((value) => value.trim().length > 0))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]?.trim() ?? ""])));
}

export function buildImportDataset(
  datasetKind: DatasetKind,
  csvText: string,
  importedAt: string
): ImportDataset {
  const securities: SecuritiesMasterInsert[] = [];
  const aliases: SecurityAliasInsert[] = [];
  let skipped = 0;

  for (const row of parseCsv(csvText)) {
    const mapped = mapFinanceDatabaseRow(datasetKind, row, importedAt);

    if (!mapped) {
      skipped += 1;
      continue;
    }

    securities.push(mapped.security);
    aliases.push(...mapped.aliases);
  }

  return {
    securities: dedupeBy(securities, (security) => security.symbol),
    aliases: dedupeBy(
      aliases,
      (alias) => `${alias.symbol}\u0000${alias.alias}\u0000${alias.alias_type}`
    ),
    skipped
  };
}

export function combineImportDatasets(datasets: ImportDataset[]): ImportDataset {
  return {
    securities: dedupeBy(
      datasets.flatMap((dataset) => dataset.securities),
      (security) => security.symbol
    ),
    aliases: dedupeBy(
      datasets.flatMap((dataset) => dataset.aliases),
      (alias) => `${alias.symbol}\u0000${alias.alias}\u0000${alias.alias_type}`
    ),
    skipped: datasets.reduce((total, dataset) => total + dataset.skipped, 0)
  };
}

export function summarizeCounts(securities: SecuritiesMasterInsert[]): VerificationCount[] {
  const counts = new Map<string, VerificationCount>();

  for (const security of securities) {
    const exchange = security.exchange ?? "";
    const key = `${security.asset_class}\u0000${security.country}\u0000${exchange}`;
    const current = counts.get(key);

    if (current) {
      current.count += 1;
    } else {
      counts.set(key, {
        asset_class: security.asset_class,
        country: security.country,
        exchange,
        count: 1
      });
    }
  }

  return [...counts.values()].sort((left, right) => {
    const leftKey = `${left.asset_class}:${left.country}:${left.exchange}`;
    const rightKey = `${right.asset_class}:${right.country}:${right.exchange}`;
    return leftKey.localeCompare(rightKey);
  });
}

function mapFinanceDatabaseRow(
  datasetKind: DatasetKind,
  row: FinanceDatabaseRow,
  importedAt: string
): { security: SecuritiesMasterInsert; aliases: SecurityAliasInsert[] } | null {
  const symbol = cleanText(row.symbol).toUpperCase();
  const name = cleanText(row.name);
  const currency = cleanText(row.currency).toUpperCase();
  const exchange = cleanNullable(row.exchange)?.toUpperCase() ?? null;
  const country = inferCountry(datasetKind, row, symbol, currency, exchange);

  if (!symbol || !name || !currency || !country) {
    return null;
  }

  const security: SecuritiesMasterInsert = {
    symbol,
    name,
    asset_class: datasetKind === "equities" ? "equity" : "etf",
    country,
    currency,
    exchange,
    market: cleanNullable(row.market),
    sector: cleanNullable(row.sector ?? row.category_group),
    industry_group: cleanNullable(row.industry_group),
    industry: cleanNullable(row.industry ?? row.category),
    website: cleanNullable(row.website),
    market_cap_bucket: cleanNullable(row.market_cap),
    isin: cleanNullable(row.isin),
    cusip: cleanNullable(row.cusip),
    figi: cleanNullable(row.figi),
    composite_figi: cleanNullable(row.composite_figi),
    shareclass_figi: cleanNullable(row.shareclass_figi),
    source: FINANCEDATABASE_SOURCE,
    source_revision: FINANCEDATABASE_REVISION,
    source_updated_at: importedAt
  };

  return { security, aliases: buildAliases(symbol, name, country) };
}

function inferCountry(
  datasetKind: DatasetKind,
  row: FinanceDatabaseRow,
  symbol: string,
  currency: string,
  exchange: string | null
): "United States" | "South Korea" | null {
  const rowCountry = cleanText(row.country);

  if (datasetKind === "equities") {
    if (rowCountry === "South Korea" && (isKoreaSymbol(symbol) || exchange === "KSC" || exchange === "KOE")) {
      return "South Korea";
    }

    if (rowCountry === "United States" && isLikelyUsEtfSymbol(symbol) && isUsExchange(exchange)) {
      return "United States";
    }

    return null;
  }

  if (isKoreaSymbol(symbol) || currency === "KRW" || exchange === "KSC" || exchange === "KOE") {
    return "South Korea";
  }

  if (currency === "USD" && isLikelyUsEtfSymbol(symbol) && isUsExchange(exchange)) {
    return "United States";
  }

  return null;
}

function buildAliases(symbol: string, name: string, country: string): SecurityAliasInsert[] {
  const aliases: SecurityAliasInsert[] = [
    { symbol, alias: name, alias_type: "name", source: FINANCEDATABASE_SOURCE }
  ];
  const localSymbol = country === "South Korea" ? symbol.match(/^(\d{6})\.(KS|KQ)$/)?.[1] : undefined;

  if (localSymbol) {
    aliases.push({
      symbol,
      alias: localSymbol,
      alias_type: "local_symbol",
      source: FINANCEDATABASE_SOURCE
    });
  }

  return aliases;
}

function cleanText(value: string | undefined): string {
  return (value ?? "").trim();
}

function cleanNullable(value: string | undefined): string | null {
  const cleaned = cleanText(value);
  return cleaned.length > 0 ? cleaned : null;
}

function isKoreaSymbol(symbol: string): boolean {
  return /\.(KS|KQ)$/.test(symbol);
}

function isLikelyUsEtfSymbol(symbol: string): boolean {
  return /^[A-Z][A-Z0-9-]{0,9}$/.test(symbol);
}

function isUsExchange(exchange: string | null): boolean {
  return exchange !== null && ["ASE", "BTS", "NCM", "NGM", "NIM", "NMS", "NYQ", "PCX"].includes(exchange);
}

function dedupeBy<T>(items: T[], keyFor: (item: T) => string): T[] {
  const seen = new Set<string>();
  const deduped: T[] = [];

  for (const item of items) {
    const key = keyFor(item);
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  return deduped;
}
