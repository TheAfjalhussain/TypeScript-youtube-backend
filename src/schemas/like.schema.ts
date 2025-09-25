import { isValidObjectId } from "mongoose"
import { z } from "zod"

export const toggleVideoLikeSchema = z.object({
    videoId: z.string().refine((val) => isValidObjectId(val), {
        message: "Invalid video Id !!.."
    })
})

export const toggleCommentLikeSchema = z.object({
    commentId: z.string().refine((val) => isValidObjectId(val), {
        message: "Invalid comment Id !!.."
    })
})

export const toggleTweetLikeSchema = z.object({
    tweetId: z.string().refine((val) => isValidObjectId(val), {
        message: "Invalid tweet Id !!.."
    })
})