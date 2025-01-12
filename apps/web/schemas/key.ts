import { z } from "zod";

export const keySchema = z.object({
  key: z.string().min(1, { message: "API key is required" }),
  type: z.enum(["openai", "anthropic", "openrouter"]).default("openrouter"),
});
