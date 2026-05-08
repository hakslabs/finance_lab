import { isAuthorizedCronRequest, unauthorizedCronResponse } from "@/app/_lib/auth/cron";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CronRouteContext = {
  params: Promise<{
    job: string;
  }>;
};

export async function GET(request: Request, { params }: CronRouteContext): Promise<Response> {
  if (!isAuthorizedCronRequest(request)) {
    return unauthorizedCronResponse();
  }

  const { job } = await params;

  if (job !== "__health") {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}
