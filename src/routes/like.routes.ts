import { Router } from "express";
import { VerifyAuth } from "../middleware/Auth.middleware";
import { 
    getLikedVideos,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike 
} from "../controllers/like.controller";

export const likeRouter = Router()

likeRouter.use(VerifyAuth)

likeRouter.post("/toggle/:videoId", toggleVideoLike)
likeRouter.post("/toggle/:commentId", toggleCommentLike)
likeRouter.post("/toggle/:tweetId", toggleTweetLike)
likeRouter.get("/videos", getLikedVideos)