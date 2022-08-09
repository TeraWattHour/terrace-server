import { z } from "zod";

export const search_list_dto = z.object({
  term: z.string().min(3).max(64),
});

export const create_list_dto = z.object({
  name: z.string().min(4).max(32),
  description: z.string().min(4).max(255),
  thumbnailUrl: z.optional(z.string().url()),
  bannerUrl: z.optional(z.string().url()),
});

export const get_list_dto = z.object({
  listId: z
    .string()
    .transform(Number)
    .refine((x) => x >= 1),
});
