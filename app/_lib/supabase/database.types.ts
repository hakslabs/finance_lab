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
      quotes_daily: {
        Row: {
          symbol: string;
          date: string;
          open: number | null;
          high: number | null;
          low: number | null;
          close: number | null;
          vol: number | null;
        };
        Insert: {
          symbol: string;
          date: string;
          open?: number | null;
          high?: number | null;
          low?: number | null;
          close?: number | null;
          vol?: number | null;
        };
        Update: {
          symbol?: string;
          date?: string;
          open?: number | null;
          high?: number | null;
          low?: number | null;
          close?: number | null;
          vol?: number | null;
        };
        Relationships: [];
      };
      indices: {
        Row: {
          code: string;
          value: number | null;
          change: number | null;
          spark: number[];
          updated_at: string;
        };
        Insert: {
          code: string;
          value?: number | null;
          change?: number | null;
          spark?: number[];
          updated_at?: string;
        };
        Update: {
          code?: string;
          value?: number | null;
          change?: number | null;
          spark?: number[];
          updated_at?: string;
        };
        Relationships: [];
      };
      sentiment: {
        Row: { code: string; value: number | null; band: string | null; ts: string };
        Insert: { code: string; value?: number | null; band?: string | null; ts?: string };
        Update: { code?: string; value?: number | null; band?: string | null; ts?: string };
        Relationships: [];
      };
      financials: {
        Row: {
          symbol: string;
          period: string;
          is_json: Json;
          bs_json: Json;
          cf_json: Json;
          ratios_json: Json;
          updated_at: string;
        };
        Insert: {
          symbol: string;
          period: string;
          is_json?: Json;
          bs_json?: Json;
          cf_json?: Json;
          ratios_json?: Json;
          updated_at?: string;
        };
        Update: {
          symbol?: string;
          period?: string;
          is_json?: Json;
          bs_json?: Json;
          cf_json?: Json;
          ratios_json?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      news: {
        Row: {
          id: string;
          src: string;
          title: string;
          url: string;
          summary: string | null;
          tickers: string[];
          sentiment: number | null;
          published_at: string;
        };
        Insert: {
          id?: string;
          src: string;
          title: string;
          url: string;
          summary?: string | null;
          tickers?: string[];
          sentiment?: number | null;
          published_at: string;
        };
        Update: {
          id?: string;
          src?: string;
          title?: string;
          url?: string;
          summary?: string | null;
          tickers?: string[];
          sentiment?: number | null;
          published_at?: string;
        };
        Relationships: [];
      };
      master_profiles: {
        Row: {
          id: string;
          name: string;
          firm: string | null;
          style: string | null;
          philosophy_md: string | null;
          books: Json;
          videos: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          firm?: string | null;
          style?: string | null;
          philosophy_md?: string | null;
          books?: Json;
          videos?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          firm?: string | null;
          style?: string | null;
          philosophy_md?: string | null;
          books?: Json;
          videos?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      master_holdings: {
        Row: {
          master_id: string;
          symbol: string;
          weight: number | null;
          shares: number | null;
          qoq_delta: number | null;
          quarter: string;
        };
        Insert: {
          master_id: string;
          symbol: string;
          weight?: number | null;
          shares?: number | null;
          qoq_delta?: number | null;
          quarter: string;
        };
        Update: {
          master_id?: string;
          symbol?: string;
          weight?: number | null;
          shares?: number | null;
          qoq_delta?: number | null;
          quarter?: string;
        };
        Relationships: [
          {
            foreignKeyName: "master_holdings_master_id_fkey";
            columns: ["master_id"];
            isOneToOne: false;
            referencedRelation: "master_profiles";
            referencedColumns: ["id"];
          }
        ];
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
      api_quota: {
        Row: { provider: string; day: string; used: number; limit: number };
        Insert: { provider: string; day: string; used?: number; limit: number };
        Update: { provider?: string; day?: string; used?: number; limit?: number };
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
      reports: {
        Row: {
          id: string;
          src: string;
          category: string;
          title: string;
          pdf_url: string | null;
          markdown: string | null;
          summary: string | null;
          tickers: string[];
          tags: string[];
          published_at: string;
        };
        Insert: {
          id?: string;
          src: string;
          category: string;
          title: string;
          pdf_url?: string | null;
          markdown?: string | null;
          summary?: string | null;
          tickers?: string[];
          tags?: string[];
          published_at: string;
        };
        Update: {
          id?: string;
          src?: string;
          category?: string;
          title?: string;
          pdf_url?: string | null;
          markdown?: string | null;
          summary?: string | null;
          tickers?: string[];
          tags?: string[];
          published_at?: string;
        };
        Relationships: [];
      };
      reports_tables: {
        Row: { report_id: string; idx: number; table_json: Json };
        Insert: { report_id: string; idx: number; table_json: Json };
        Update: { report_id?: string; idx?: number; table_json?: Json };
        Relationships: [
          {
            foreignKeyName: "reports_tables_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          }
        ];
      };
      watchlists: {
        Row: { id: string; user_id: string; name: string; symbols: string[]; created_at: string };
        Insert: { id?: string; user_id: string; name: string; symbols?: string[]; created_at?: string };
        Update: { id?: string; user_id?: string; name?: string; symbols?: string[]; created_at?: string };
        Relationships: [];
      };
      holdings: {
        Row: { id: string; user_id: string; symbol: string; qty: number; avg_px: number | null; currency: string; updated_at: string };
        Insert: { id?: string; user_id: string; symbol: string; qty?: number; avg_px?: number | null; currency: string; updated_at?: string };
        Update: { id?: string; user_id?: string; symbol?: string; qty?: number; avg_px?: number | null; currency?: string; updated_at?: string };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          ts: string;
          type: Database["public"]["Enums"]["transaction_type"];
          symbol: string;
          qty: number;
          px: number;
          fee: number;
          currency: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ts?: string;
          type: Database["public"]["Enums"]["transaction_type"];
          symbol: string;
          qty?: number;
          px?: number;
          fee?: number;
          currency: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ts?: string;
          type?: Database["public"]["Enums"]["transaction_type"];
          symbol?: string;
          qty?: number;
          px?: number;
          fee?: number;
          currency?: string;
        };
        Relationships: [];
      };
      notes: {
        Row: { id: string; user_id: string; symbol_or_ref: string; md: string; created_at: string };
        Insert: { id?: string; user_id: string; symbol_or_ref: string; md: string; created_at?: string };
        Update: { id?: string; user_id?: string; symbol_or_ref?: string; md?: string; created_at?: string };
        Relationships: [];
      };
      saved_screens: {
        Row: { id: string; user_id: string; name: string; filters_json: Json; created_at: string };
        Insert: { id?: string; user_id: string; name: string; filters_json?: Json; created_at?: string };
        Update: { id?: string; user_id?: string; name?: string; filters_json?: Json; created_at?: string };
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
      articles: {
        Row: {
          id: string;
          category: string;
          title: string;
          md: string;
          published_at: string | null;
          status: Database["public"]["Enums"]["article_status"];
        };
        Insert: {
          id?: string;
          category: string;
          title: string;
          md: string;
          published_at?: string | null;
          status?: Database["public"]["Enums"]["article_status"];
        };
        Update: {
          id?: string;
          category?: string;
          title?: string;
          md?: string;
          published_at?: string | null;
          status?: Database["public"]["Enums"]["article_status"];
        };
        Relationships: [];
      };
      terms: {
        Row: {
          id: string;
          term: string;
          definition: string;
          related_tickers: string[];
          category: string;
        };
        Insert: {
          id?: string;
          term: string;
          definition: string;
          related_tickers?: string[];
          category: string;
        };
        Update: {
          id?: string;
          term?: string;
          definition?: string;
          related_tickers?: string[];
          category?: string;
        };
        Relationships: [];
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          type: Database["public"]["Enums"]["bookmark_type"];
          ref_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: Database["public"]["Enums"]["bookmark_type"];
          ref_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: Database["public"]["Enums"]["bookmark_type"];
          ref_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      follows: {
        Row: {
          user_id: string;
          master_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          master_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          master_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follows_master_id_fkey";
            columns: ["master_id"];
            isOneToOne: false;
            referencedRelation: "master_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          rule_json: Json;
          channel: Database["public"]["Enums"]["alert_channel"];
          enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          rule_json?: Json;
          channel?: Database["public"]["Enums"]["alert_channel"];
          enabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          rule_json?: Json;
          channel?: Database["public"]["Enums"]["alert_channel"];
          enabled?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      alerts_queue: {
        Row: {
          id: string;
          user_id: string;
          rule: Json;
          status: Database["public"]["Enums"]["cron_status"];
          evaluated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          rule?: Json;
          status?: Database["public"]["Enums"]["cron_status"];
          evaluated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          rule?: Json;
          status?: Database["public"]["Enums"]["cron_status"];
          evaluated_at?: string | null;
        };
        Relationships: [];
      };
      user_report_bookmarks: {
        Row: {
          user_id: string;
          report_id: string;
          note_md: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          report_id: string;
          note_md?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          report_id?: string;
          note_md?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_report_bookmarks_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      claim_api_quota: {
        Args: { p_provider: string; p_day: string; p_amount: number; p_limit: number };
        Returns: {
          provider: string;
          day: string;
          used: number;
          limit: number;
          remaining: number;
          status: "ok" | "warning" | "exhausted";
          claimed: boolean;
        }[];
      };
    };
    Enums: {
      article_status: "draft" | "published" | "archived";
      alert_channel: "push" | "email";
      bookmark_type: "term" | "article" | "report";
      cron_status: "running" | "ok" | "failed";
      transaction_type: "buy" | "sell" | "div" | "cash";
    };
    CompositeTypes: Record<string, never>;
  };
};
