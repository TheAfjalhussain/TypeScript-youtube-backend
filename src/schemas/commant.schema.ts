import { isValidObjectId } from "mongoose"
import { z } from "zod"

export const getVideoCommentsSchema = z.object({
    params: z.object({
        videoId: z.string().refine((val) => isValidObjectId(val), {
        message: "Invalid video Id !!.."
      })
    }),
    query: z.object({
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("10")
    })
})

export const addCommentSchema = z.object({
    params: z.object({
        videoId: z.string().refine((val) => isValidObjectId(val), {
        message: "Invalid video Id !!.."
      })
    }),
    body: z.object({
       content: z.string()
    })
})

export const updateCommentSchema = z.object({
    params: z.object({
        commentId: z.string().refine((val) => isValidObjectId(val), {
        message: "Invalid Comment Id !!.."
      })
    }),
    body: z.object({
       content: z.string()
    })
})

export const deleteCommentSchema = z.object({
    commentId: z.string().refine((val) => isValidObjectId(val), {
        message: "Invalid Comment Id !!.."
    })
})
