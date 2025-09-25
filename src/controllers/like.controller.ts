import { Response } from "express";
import { VerifyAuthRequest } from "../middleware/Auth.middleware";
import { AsyncHandler } from "../utils/AsyncHandler";
import { 
    toggleCommentLikeSchema, 
    toggleTweetLikeSchema, 
    toggleVideoLikeSchema 
} from "../schemas/like.schema";
import { ApiError } from "../utils/ApiError";
import { Like } from "../models/like.model";
import { ApiResponse } from "../utils/ApiResponce";
import mongoose, { isValidObjectId } from "mongoose";

export const toggleVideoLike = AsyncHandler( async(req: VerifyAuthRequest, res: Response) => {
    const { success, data } = toggleVideoLikeSchema.safeParse(req.params)
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !!..");       
    }
    const { videoId } = data
    const alreadyVideoLike = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })
    if (alreadyVideoLike) {
        await Like.findByIdAndDelete(alreadyVideoLike?._id)
        return res 
        .status(201)
        .json(
            new ApiResponse(
                200,
                {isLiked: false},
                "video like removed successfully !!.."
            )
        )
    }
    const likeVideo = await Like.create(
        {
            video: videoId,
            likedBy: req.user?._id
        }
    )
    if (!likeVideo) {
        throw new ApiError(500, "Error while liking the video !!..");     
    }
    return res 
    .status(201)
    .json(
        new ApiResponse(
            200,
            likeVideo,
            "video liked successfully !!.."
        )
    )
})

export const toggleCommentLike = AsyncHandler( async(req: VerifyAuthRequest, res: Response) => {
    const { success, data } = toggleCommentLikeSchema.safeParse(req.params)
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !!..");       
    }
    const { commentId } = data
    const alreadyCommentLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })
    if (alreadyCommentLike) {
        await Like.findByIdAndDelete(alreadyCommentLike._id)
        return res 
        .status(201) 
        .json(
            new ApiResponse(
                200,
                {isLiked: false},
                "Comment liked removed Successfully !!.."
            )
        )
    }
    const likeComment = await Like.create(
        {
            comment: commentId,
            likedBy: req.user?._id
        }
    )
    if (!likeComment) {
        throw new ApiError(500, "Error while liking the Comment !!..");     
    }
    return res 
    .status(201)
    .json(
        new ApiResponse(
            200,
            likeComment,
            "Comment liked successfully !!.."
        )
    )
})

export const toggleTweetLike = AsyncHandler( async(req: VerifyAuthRequest, res: Response) => {
    const { success, data } = toggleTweetLikeSchema.safeParse(req.params)
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !!..");       
    }
    const { tweetId } = data
    const alreadyTweetLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    })
    if (alreadyTweetLike) {
        await Like.findByIdAndDelete(alreadyTweetLike?._id)
        return res 
        .status(201) 
        .json(
            new ApiResponse(
                200,
                {isLiked: false},
                "Tweet liked removed Successfully !!.."
            )
        )
    }
    const likeTweet = await Like.create(
        {
            comment: tweetId,
            likedBy: req.user?._id
        }
    )
    if (!likeTweet) {
        throw new ApiError(500, "Error while liking the Tweet !!..");     
    }
    return res 
    .status(201)
    .json(
        new ApiResponse(
            200,
            likeTweet,
            "Tweet liked successfully !!.."
        )
    )
})

export const getLikedVideos = AsyncHandler( async (req: VerifyAuthRequest, res: Response) => {
    if (!isValidObjectId(req.user?._id)) {
        throw new ApiError(400, "Invalid User Id");
    }
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails"
                        }
                    }, 
                    {
                        $unwind: "$ownerDetails"
                    }
                ]
            }
        },
        {
            $unwind: "$likedVideos"
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 1,
                likedVideos: {
                    _id: 1,
                    "video.url": 1,
                    "video.thumbnail": 1,
                    duration: 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    createdAt: 1,
                    ispublished: 1,
                    ownerDetails: {
                        "avatar.url": 1,
                        username: 1,
                        fullName: 1
                    }
                }
            }
        }
    ])
    console.log(likedVideos);
    if (!likedVideos) {
        throw new ApiError(500 ,"Error while getting liked Videos from server !!..");
    }
    return res 
    .status(200)
    .json(
        new ApiResponse(
            200, 
            likedVideos,
            "liked videos fetched successfully !!.."
        )
    )
} )