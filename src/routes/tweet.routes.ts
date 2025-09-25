import { Router } from "express";
import { VerifyAuth } from "../middleware/Auth.middleware";
import { 
    createTweet, 
    deleteTweet, 
    getUserTweets, 
    updateTweet
} from "../controllers/tweet.controller";

export const tweetRouter = Router()

tweetRouter.use(VerifyAuth)

tweetRouter.post("/create", createTweet)
tweetRouter.patch("/:tweetId", updateTweet)
tweetRouter.delete("/:tweetId", deleteTweet)
tweetRouter.get("/user/:userId", getUserTweets)