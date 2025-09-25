import { isValidObjectId } from "mongoose"
import { z } from "zod"

export const toggleSubscriptionSchema = z.object({
    channelId: z.string().refine((val) => isValidObjectId(val), {
        message: "Invalid channel Id !!.."
    })
})

export const getUserChannelSubscribersSchema = z.object({
    channelId: z.string().refine((val) => isValidObjectId(val), {
        message: "Invalid channel Id !!.."
    })
})

export const getSubscribedChannelsSchema = z.object({
    subscriberId: z.string().refine((val) => isValidObjectId(val), {
        message: "Invalid subscriber Id !!.."
    })
})
