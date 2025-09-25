import { isValidObjectId } from "mongoose";
import { z } from "zod"

export const getAllVideosSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Page must be a positive number",
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Limit must be a positive number",
    }),
  query: z.string().optional(),
  sortBy: z.string().optional(),
  sortType: z.enum(["asc", "desc"]).optional(),
  userId: z
    .string()
    .optional()
    .refine((val) => !val || isValidObjectId(val), {
      message: "Invalid userId format",
    }),
});


export const publishVideoSchema = z.object({
  body: z.object({
    title: z.string(),
    description: z.string()
  }),
  files: z.object({
    videoFile: z
      .array(
        z.object({
          path: z.string()
        })
      ),
    thumbnail: z
      .array(
        z.object({
          path: z.string()
        })
      )
  }),
});

export const getVideoByIdSchema = z.object({
  videoId: z.string().refine((val) => isValidObjectId(val), {
    message: "Invalid Video Id format !!.."
  })
})

export const updateVideoSchema = z.object({
  params: z.object({
    videoId: z.string().refine((val) => isValidObjectId(val), {
    message: "Invalid video Id !!."
   }),
  }),
  body: z.object({
    title: z.string(),
    description: z.string(),
    isPublished: z.boolean()
  }),
  file: z.object({
    path: z.string()
  })
})

export const deleteVideoSchema = z.object({
  videoId: z.string().refine((val) => isValidObjectId(val), {
    message: "Invalid Video Id format !!.."
  })
})

export const togglePublishStatusSchema = z.object({
  videoId: z.string().refine((val) => isValidObjectId(val), {
    message: "Invalid Video Id format !!.."
  })
})