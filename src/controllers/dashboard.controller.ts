import { Response } from "express";
import { VerifyAuthRequest } from "../middleware/Auth.middleware";
import { AsyncHandler } from "../utils/AsyncHandler";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError";
import { Video } from "../models/video.model";
import { ApiResponse } from "../utils/ApiResponce";
import { Subscription } from "../models/subscription.model";


export const getChannelVideos = AsyncHandler( async(req: VerifyAuthRequest, res: Response) => {
    const userId = req.user?._id
    if (!isValidObjectId(userId)) {
        throw new ApiError(400 , "Invalid user Id !!..");
    }
    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {  
                createdAt: {
                    $dateToParts: {
                        date: "$createdAt"
                    }
                },
                likeCount: {
                    $size: "$likes"
                },
            }
        },
        {
            $project: {
                _id: 1,
                "videoFile.url": 1,
                "thumbnail.url": 1,
                title: 1,
                description: 1,
                createdAt: {
                    year: 1,
                    month: 1,
                    day: 1,
                },
                isPublished: 1,
                likesCount: 1,
            },
        },
    ])
    console.log("videos", videos);
    if (!videos) {
        throw new ApiError(500 , "Error while fetching videos !!..");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videos,
            "channel all videos fetched successfully"
        )
    );
})

// Get the channel stats like total video views, total subscribers, total videos, total likes etc.

export const getChannelStats = AsyncHandler( async(req: VerifyAuthRequest, res: Response) => {
    const userId = req.user?._id
    if (!isValidObjectId(userId)) {
        throw new ApiError(400 , "Invalid user Id !!..");
    }
    const totalSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                SubscribersCount: {
                    $sum: 1
                }
            }
        }
    ])

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $project: {
                totalLikes: {
                    $size: "$likes"
                },
                totalViews: "$views",
                totalVideos: 1, 
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: {
                    $sum: "$totalLikes",
                },
                totalViews: {
                    $sum: "$totalViews",
                },
                totalVideos: {
                    $sum: 1,
                },
            },
        },
    ])

    const channelStats = {
        totalSubscribers: totalSubscribers[0]?.SubscriberCount || 0,
        totalLikes: videos[0]?.totalLikes || 0,
        totalViews: videos[0]?.totalViews || 0,
        totalVideos: videos[0]?.totalVideos || 0,
    };

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channelStats,
                "channel stats fetched successfully"
            )
        );
})