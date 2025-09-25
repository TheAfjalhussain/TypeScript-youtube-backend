import { isValidObjectId } from "mongoose"
import { z } from "zod"

export const createTweetSchema = z.object({
    content: z.string(),
})

export const updateTweetSchema = z.object({
    params: z.object({
        tweetId: z.string().refine((val) => isValidObjectId(val), {
            message: "Invalid tweet Id ."
        }),
    }),
    body: z.object({
        content: z.string(),
    })
})

export const deleteTweetSchema = z.object({
    tweetId: z.string().refine((val) => isValidObjectId(val), {
        message: "Invalid tweet Id ."
    })
})

export const getUserTweetsSchema = z.object({
    userId: z.string().refine((val) => isValidObjectId(val), {
        message: "Invalid user Id ."
    })
})