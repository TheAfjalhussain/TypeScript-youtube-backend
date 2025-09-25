import { Router } from "express";
import { userRouter } from "./user.routes";
import { healthCheckRouter } from "./healthCheck.routes";
import { playlistRouter } from "./playlist.routes";
import { commentRouter } from "./comment.routes";
import { videoRouter } from "./video.routes";
import { likeRouter } from "./like.routes";
import { tweetRouter } from "./tweet.routes";
import { subscriptionRouter } from "./subscription.routes";
import { dashboardRouter } from "./dashboard.routes";

export const mainRouter = Router()
mainRouter.use("/users", userRouter)
mainRouter.use("/healthcheck", healthCheckRouter)
mainRouter.use("/playlist", playlistRouter)
mainRouter.use("/comment", commentRouter)
mainRouter.use("/video", videoRouter)
mainRouter.use("/like", likeRouter)
mainRouter.use("/tweet", tweetRouter)
mainRouter.use("/subscription", subscriptionRouter)
mainRouter.use("/dashboard", dashboardRouter)
















// import { Router } from "express";
// import { userRouter } from "./user.routes";
// import { accountRouter } from "./account.routes";

// export const mainRouter = Router()

// mainRouter.use("/user", userRouter);
// mainRouter.use("/account", accountRouter);