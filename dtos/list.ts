import { checkImageLink } from "@/utils/checkImageLink";
import { z } from "zod";

const imageRefineFunc = async (x: string, ctx: z.RefinementCtx) => {
  if (x.length > 0) {
    const v = await checkImageLink(x);
    if (v[0] === false) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_string,
        fatal: true,
        message: v[1],
        validation: "url",
      });
    }
  }
};

export const create_list_dto_server = z.object({
  name: z.string().min(4).max(48),
  description: z.string().min(4).max(255),
  thumbnail: z.string().superRefine(imageRefineFunc).optional(),
  places: z
    .array(
      z.object({
        name: z.string().min(4).max(48),
        description: z.string().min(4).max(255),
        thumbnail: z.string().superRefine(imageRefineFunc).optional(),
        banner: z.string().superRefine(imageRefineFunc).optional(),
        lat: z.number().min(-90).max(90),
        lon: z.number().min(-180).max(180),
      })
    )
    .min(2)
    .max(100),
});
