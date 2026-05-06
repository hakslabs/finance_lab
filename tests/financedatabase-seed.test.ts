import { describe, expect, it } from "vitest";

import {
  FINANCEDATABASE_REVISION,
  buildImportDataset,
  combineImportDatasets,
  parseCsv,
  summarizeCounts
} from "../scripts/financedatabase-seed";

const importedAt = "2026-05-06T00:00:00.000Z";

describe("FinanceDatabase seed mapping", () => {
  it("parses quoted CSV cells without splitting summary text", () => {
    const csv = 'symbol,name,summary,currency\nAAPL,Apple Inc.,"Makes phones, tablets, and services",USD\n';

    expect(parseCsv(csv)).toEqual([
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        summary: "Makes phones, tablets, and services",
        currency: "USD"
      }
    ]);
  });

  it("maps only United States and South Korea equities and omits summaries", () => {
    const csv = [
      "symbol,name,summary,currency,sector,industry_group,industry,exchange,market,country,state,city,zipcode,website,market_cap,isin,cusip,figi,composite_figi,shareclass_figi",
      'AAPL,Apple Inc.,"Long summary must not be stored",USD,Information Technology,Technology Hardware,Consumer Electronics,NMS,NasdaqGS,United States,CA,Cupertino,95014,https://www.apple.com,Mega Cap,US0378331005,037833100,BBG000B9XRY4,BBG000B9XRY4,BBG001S5N8V8',
      '005930.KS,Samsung Electronics Co Ltd,"Another summary",KRW,Information Technology,Semiconductors,Semiconductors,KSC,KOSPI Stock Market,South Korea,,,,https://www.samsung.com,Large Cap,KR7005930003,,,,',
      "US.F,Foreign listing of US company,Summary,EUR,Industrials,Capital Goods,Machinery,FRA,Frankfurt Stock Exchange,United States,,,,,Large Cap,,,,,",
      "7203.T,Toyota Motor Corporation,Summary,JPY,Consumer Discretionary,Automobiles,Automobiles,JPX,Tokyo Stock Exchange,Japan,,,,,Large Cap,,,,,"
    ].join("\n");

    const dataset = buildImportDataset("equities", csv, importedAt);

    expect(dataset.securities).toHaveLength(2);
    expect(dataset.skipped).toBe(2);
    expect(dataset.securities[0]).toMatchObject({
      symbol: "AAPL",
      asset_class: "equity",
      country: "United States",
      source_revision: FINANCEDATABASE_REVISION,
      source_updated_at: importedAt
    });
    expect(dataset.securities[0]).not.toHaveProperty("summary");
    expect(dataset.aliases).toEqual(
      expect.arrayContaining([
        { symbol: "AAPL", alias: "Apple Inc.", alias_type: "name", source: "FinanceDatabase" },
        {
          symbol: "005930.KS",
          alias: "Samsung Electronics Co Ltd",
          alias_type: "name",
          source: "FinanceDatabase"
        },
        {
          symbol: "005930.KS",
          alias: "005930",
          alias_type: "local_symbol",
          source: "FinanceDatabase"
        }
      ])
    );
  });

  it("infers ETF country from safe exchange, currency, and symbol metadata", () => {
    const csv = [
      "symbol,name,currency,summary,category_group,category,family,exchange,isin",
      "SPY,SPDR S&P 500 ETF Trust,USD,Summary,Large Cap,Blend,State Street,PCX,US78462F1030",
      "069500.KS,KODEX 200,KRW,Summary,Information Technology,Large Cap,Samsung,KSC,KR7069500007",
      "AASU.L,Listed in London,USD,Summary,Equity,,Issuer,LSE,IE0000000000",
      "^BND,Vanguard index variant,USD,Summary,Fixed Income,Bonds,Vanguard,NIM,"
    ].join("\n");

    const dataset = buildImportDataset("etfs", csv, importedAt);

    expect(dataset.securities.map((security) => security.symbol)).toEqual(["SPY", "069500.KS"]);
    expect(dataset.securities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ symbol: "SPY", asset_class: "etf", country: "United States" }),
        expect.objectContaining({ symbol: "069500.KS", asset_class: "etf", country: "South Korea" })
      ])
    );
    expect(dataset.skipped).toBe(2);
  });

  it("deduplicates securities and aliases across datasets and summarizes verification counts", () => {
    const first = buildImportDataset(
      "etfs",
      [
        "symbol,name,currency,summary,category_group,category,family,exchange,isin",
        "SPY,SPDR S&P 500 ETF Trust,USD,Summary,Large Cap,Blend,State Street,PCX,US78462F1030"
      ].join("\n"),
      importedAt
    );
    const second = buildImportDataset(
      "etfs",
      [
        "symbol,name,currency,summary,category_group,category,family,exchange,isin",
        "SPY,SPDR S&P 500 ETF Trust,USD,Summary,Large Cap,Blend,State Street,PCX,US78462F1030"
      ].join("\n"),
      importedAt
    );

    const combined = combineImportDatasets([first, second]);

    expect(combined.securities).toHaveLength(1);
    expect(combined.aliases).toHaveLength(1);
    expect(summarizeCounts(combined.securities)).toEqual([
      { asset_class: "etf", country: "United States", exchange: "PCX", count: 1 }
    ]);
  });
});
