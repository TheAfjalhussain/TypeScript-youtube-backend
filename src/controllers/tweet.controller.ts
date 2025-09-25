import { Response } from "express";
import { VerifyAuthRequest } from "../middleware/Auth.middleware";
import { AsyncHandler } from "../utils/AsyncHandler";
import { Tweet } from "../models/tweet.model";
import { 
    createTweetSchema, 
    deleteTweetSchema, 
    getUserTweetsSchema, 
    updateTweetSchema 
} from "../schemas/tweet.schema";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponce";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model";


export const createTweet = AsyncHandler( async(req: VerifyAuthRequest, res: Response) => {
    const{ success, data } = createTweetSchema.safeParse(req.body)
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !!..");
    }
    const { content } = data
    if (!content) {
      throw new ApiError(400, "Content is required");
    }
    const create = await Tweet.create({
        owner: req.user?._id,
        content: content
    })
    if (!content) {
      throw new ApiError(500, "Error while creating tweet !!..");
    }
    return res 
    .status(201).
    json(
        new ApiResponse(
            200,
            create,
            "tweet created successfully !!.."
        )
    )
})

export const updateTweet = AsyncHandler( async(req: VerifyAuthRequest, res: Response) => {
    const{ success, data } = updateTweetSchema.safeParse({
        params: req.params,
        body: req.body
    })
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !!..");
    }
    const { tweetId } = data.params
    const { content } = data.body
    if (!content) {
      throw new ApiError(400, "Content is required");
    }
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }
  
    if (tweet?.owner.toString() !== req.user?._id.toString()) {
      throw new ApiError(400, "Only owner can edit their tweet");
    }
    const update = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: content
            }
        },
        {
            new: true
        }
    )
    if (!update) {
      throw new ApiError(500, "Error while updating tweet !!..");
    }
    return res 
    .status(201).
    json(
        new ApiResponse(
            200,
            update,
            "tweet updated successfully !!.."
        )
    )
})

export const deleteTweet = AsyncHandler( async(req: VerifyAuthRequest, res: Response) => {
    const{ success, data } = deleteTweetSchema.safeParse(req.params)
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !!..");
    }
    const { tweetId } = data
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }
    if (tweet?.owner.toString() !== req.user?._id.toString()) {
      throw new ApiError(400, "Only owner can edit their tweet");
    }
    const deletetweet = await Tweet.findByIdAndDelete(tweetId)
    if (!deletetweet) {
      throw new ApiError(500, "Error while deleting tweet !!..");
    }
    return res 
    .status(201).
    json(
        new ApiResponse(
            200,
            deletetweet,
            "tweet deleted successfully !!.."
        )
    )
})

export const getUserTweets = AsyncHandler( async(req: VerifyAuthRequest, res: Response) => {
    const{ success, data } = getUserTweetsSchema.safeParse(req.params)
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !!..");
    }
    const { userId } = data
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const getAllTweets = await Tweet.aggregate([
        {
            $match: {
                owner: userId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            "avatar.url": 1,
                            Fullname: 1,
                            username: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likeDetails",
                pipeline: [
                    {
                        $project: {
                            likedBy: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likedCount: {
                    $size: "$likeDetails"
                },
                owner: {
                    $first: "$ownerDetails"
                },
                isLiked: {
                    $cond: {
                        $if: {
                            $in: [userId, "$likeDetails.likedBy"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                content: 1,
                owner: 1,
                likesCount: 1,
                createdAt: 1,
                isLiked: 1,
            }
        }
    ])
    console.log("getAllTweets", getAllTweets);
    if (!getAllTweets) {
      throw new ApiError(500, "Error while getting all tweets");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, getAllTweets, "All tweets fetched successfully"));
  
})