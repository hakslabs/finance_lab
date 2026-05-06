import { isAuthorizedCronRequest, unauthorizedCronResponse } from "@/app/_lib/auth/cron";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CronRouteContext = {
  params: {
    job: string;
  };
};

export function GET(request: Request, { params }: CronRouteContext): Response {
  if (!isAuthorizedCronRequest(request)) {
    return unauthorizedCronResponse();
  }

  if (params.job !== "__health") {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}
