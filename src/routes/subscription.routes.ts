import { Router } from "express";
import { VerifyAuth } from "../middleware/Auth.middleware";
import { 
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription 
} from "../controllers/subscription.controller";

export const subscriptionRouter = Router()

subscriptionRouter.use(VerifyAuth)

subscriptionRouter.post("/:channelId", toggleSubscription)
subscriptionRouter.get("/:channelId", getUserChannelSubscribers)
subscriptionRouter.get("/user/:subscriberId", getSubscribedChannels)

