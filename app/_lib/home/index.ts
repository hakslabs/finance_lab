/**
 * Widget barrel export — single import point for all dashboard widgets.
 */

export { GreetingHero } from "./widgets/greeting-hero";
export type { GreetingHeroProps } from "./widgets/greeting-hero";

export { IndexStrip } from "./widgets/index-strip";
export type { IndexStripProps } from "./widgets/index-strip";

export { MajorStocks } from "./widgets/major-stocks";
export type { MajorStocksProps } from "./widgets/major-stocks";

export { MarketSentiment } from "./widgets/market-sentiment";
export type { MarketSentimentProps } from "./widgets/market-sentiment";

export { WatchlistQuickView } from "./widgets/watchlist-quick-view";
export type { WatchlistQuickViewProps } from "./widgets/watchlist-quick-view";

export { TopNews } from "./widgets/top-news";
export type { TopNewsProps } from "./widgets/top-news";

export { MiniMarketMap } from "./widgets/mini-market-map";
export type { MiniMarketMapProps } from "./widgets/mini-market-map";

export { ReturnVsMarket } from "./widgets/return-vs-market";
export type { ReturnVsMarketProps } from "./widgets/return-vs-market";

export { WeeklyCalendar } from "./widgets/weekly-calendar";
export type { WeeklyCalendarProps } from "./widgets/weekly-calendar";

export { GlobalHeader } from "./global-header";
export type { GlobalHeaderProps } from "./global-header";

export { fetchDashboardData } from "./dashboard-data";
export type {
  DashboardData,
  IndexData,
  StockQuote,
  SentimentReading,
  NewsItem,
  CalendarEvent,
} from "./dashboard-data";
