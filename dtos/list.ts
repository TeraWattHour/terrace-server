import { z } from "zod";

export const search_list_dto = z.object({
  term: z.string().min(3).max(64),
});
const isUrl = (test: string) => {
  try {
    new URL(test);
    const ext = test.split(".")[test.split(".").length - 1];
    const allowed = ["png", "jpg", "jpeg", "webp"];
    if (!allowed.includes(ext)) return false;
    return true;
  } catch (e) {
    return false;
  }
};

export const create_list_dto = z.object({
  name: z.string().min(4).max(48),
  description: z.string().min(4).max(255),
  thumbnail: z
    .string()
    .refine((x) => x?.length === 0 || isUrl(x))
    .optional(),
  places: z
    .array(
      z.object({
        name: z.string().min(4).max(48),
        description: z.string().min(4).max(255),
        thumbnail: z
          .string()
          .refine((x) => x?.length === 0 || isUrl(x))
          .optional(),
        banner: z
          .string()
          .refine((x) => x?.length === 0 || isUrl(x))
          .optional(),
        lat: z.number().min(-90).max(90),
        lon: z.number().min(-180).max(180),
      })
    )
    .min(2)
    .max(100),
});
export const get_list_dto = z.object({
  listId: z
    .string()
    .transform(Number)
    .refine((x) => x >= 1),
});
