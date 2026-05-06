import type { Event, EventHint } from "@sentry/nextjs";

const piiKeys = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "email",
  "nickname",
  "token",
  "access_token",
  "refresh_token",
  "password"
]);

function stripSensitiveRecord(record: Record<string, string> | undefined): Record<string, string> | undefined {
  if (!record) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(record).filter(([key]) => !piiKeys.has(key.toLowerCase()))
  );
}

export function stripPiiBeforeSend<TEvent extends Event>(event: TEvent, _hint: EventHint): TEvent | null {
  const request = event.request;

  if (request) {
    event.request = {
      method: request.method,
      url: request.url,
      query_string: request.query_string,
      headers: stripSensitiveRecord(request.headers)
    };
  }

  if (event.user) {
    event.user = event.user.id ? { id: event.user.id } : undefined;
  }

  return event;
}
