import { z } from "zod";

export const searchRouteQuerySchema = z.object({
  q: z.string().default(""),
  limit: z.coerce.number().int().min(1).optional()
});
