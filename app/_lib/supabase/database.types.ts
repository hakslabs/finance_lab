export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      quotes: {
        Row: { symbol: string; px: number | null; pct: number | null; ts: string };
        Insert: { symbol: string; px?: number | null; pct?: number | null; ts?: string };
        Update: { symbol?: string; px?: number | null; pct?: number | null; ts?: string };
        Relationships: [];
      };
      cron_logs: {
        Row: {
          id: string;
          job: string;
          started_at: string;
          finished_at: string | null;
          status: Database["public"]["Enums"]["cron_status"];
          err: string | null;
        };
        Insert: {
          id?: string;
          job: string;
          started_at?: string;
          finished_at?: string | null;
          status: Database["public"]["Enums"]["cron_status"];
          err?: string | null;
        };
        Update: {
          id?: string;
          job?: string;
          started_at?: string;
          finished_at?: string | null;
          status?: Database["public"]["Enums"]["cron_status"];
          err?: string | null;
        };
        Relationships: [];
      };
      securities_master: {
        Row: {
          symbol: string;
          name: string;
          asset_class: string;
          country: string;
          currency: string;
          exchange: string | null;
          market: string | null;
          sector: string | null;
          industry_group: string | null;
          industry: string | null;
          website: string | null;
          market_cap_bucket: string | null;
          isin: string | null;
          cusip: string | null;
          figi: string | null;
          composite_figi: string | null;
          shareclass_figi: string | null;
          source: string;
          source_revision: string | null;
          source_updated_at: string | null;
        };
        Insert: {
          symbol: string;
          name: string;
          asset_class: string;
          country: string;
          currency: string;
          exchange?: string | null;
          market?: string | null;
          sector?: string | null;
          industry_group?: string | null;
          industry?: string | null;
          website?: string | null;
          market_cap_bucket?: string | null;
          isin?: string | null;
          cusip?: string | null;
          figi?: string | null;
          composite_figi?: string | null;
          shareclass_figi?: string | null;
          source: string;
          source_revision?: string | null;
          source_updated_at?: string | null;
        };
        Update: {
          symbol?: string;
          name?: string;
          asset_class?: string;
          country?: string;
          currency?: string;
          exchange?: string | null;
          market?: string | null;
          sector?: string | null;
          industry_group?: string | null;
          industry?: string | null;
          website?: string | null;
          market_cap_bucket?: string | null;
          isin?: string | null;
          cusip?: string | null;
          figi?: string | null;
          composite_figi?: string | null;
          shareclass_figi?: string | null;
          source?: string;
          source_revision?: string | null;
          source_updated_at?: string | null;
        };
        Relationships: [];
      };
      security_aliases: {
        Row: { symbol: string; alias: string; alias_type: string; source: string };
        Insert: { symbol: string; alias: string; alias_type: string; source: string };
        Update: { symbol?: string; alias?: string; alias_type?: string; source?: string };
        Relationships: [
          {
            foreignKeyName: "security_aliases_symbol_fkey";
            columns: ["symbol"];
            isOneToOne: false;
            referencedRelation: "securities_master";
            referencedColumns: ["symbol"];
          }
        ];
      };
      external_source_runs: {
        Row: {
          id: string;
          provider: string;
          source_url: string | null;
          source_revision: string | null;
          started_at: string;
          finished_at: string | null;
          status: Database["public"]["Enums"]["cron_status"];
          robots_policy: string | null;
          license_note: string | null;
          err: string | null;
        };
        Insert: {
          id?: string;
          provider: string;
          source_url?: string | null;
          source_revision?: string | null;
          started_at?: string;
          finished_at?: string | null;
          status: Database["public"]["Enums"]["cron_status"];
          robots_policy?: string | null;
          license_note?: string | null;
          err?: string | null;
        };
        Update: {
          id?: string;
          provider?: string;
          source_url?: string | null;
          source_revision?: string | null;
          started_at?: string;
          finished_at?: string | null;
          status?: Database["public"]["Enums"]["cron_status"];
          robots_policy?: string | null;
          license_note?: string | null;
          err?: string | null;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          user_id: string;
          currency: string;
          language: string;
          theme: string;
          notif_json: Json;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          currency?: string;
          language?: string;
          theme?: string;
          notif_json?: Json;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          currency?: string;
          language?: string;
          theme?: string;
          notif_json?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { cron_status: "running" | "ok" | "failed" };
    CompositeTypes: Record<string, never>;
  };
};
