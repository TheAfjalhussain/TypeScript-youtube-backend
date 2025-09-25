import { Router } from "express";
import { VerifyAuth } from "../middleware/Auth.middleware";
import { 
    addComment, 
    deleteComment, 
    getVideoComments,
    updateComment
} from "../controllers/comment.controller";

export const commentRouter = Router()

commentRouter.use(VerifyAuth)

commentRouter.get("/:videoId", getVideoComments)
commentRouter.post("/:videoId", addComment)
commentRouter.patch("/c/:commentId", updateComment)
commentRouter.delete("/c/:commentId", deleteComment)