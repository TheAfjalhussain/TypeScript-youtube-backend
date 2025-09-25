import { Response } from "express";
import { VerifyAuthRequest } from "../middleware/Auth.middleware";
import { AsyncHandler } from "../utils/AsyncHandler";
import { 
    getSubscribedChannelsSchema,
    getUserChannelSubscribersSchema, 
    toggleSubscriptionSchema 
} from "../schemas/subscription.schema";
import { ApiError } from "../utils/ApiError";
import { Subscription } from "../models/subscription.model";
import { ApiResponse } from "../utils/ApiResponce";


export const toggleSubscription = AsyncHandler( async(req: VerifyAuthRequest, res: Response) => {
    const { success, data } = toggleSubscriptionSchema.safeParse(req.params)
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !!..");       
    }
    const { channelId } = data
    const isSubscribed = await Subscription.findById({
        subscriber: req.user?._id,
        channel: channelId
    }) 
    if (isSubscribed) {
        await Subscription.findByIdAndDelete(isSubscribed._id)
        return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { isSubscribed: false },
            "Unsubscribed successfully"
          )
        );
    }
    const subscribing = await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId
    })
    if (!subscribing) {
        throw new ApiError(500, "Error while subscribing channel !!..");       
    }
    return res 
    .status(200)
    .json(
        new ApiResponse(200, subscribing, "Channel subscribed successfully !!..")
    )
})

export const getUserChannelSubscribers = AsyncHandler( async(req: VerifyAuthRequest, res: Response) => {
    const { success, data } = getUserChannelSubscribersSchema.safeParse(req.params)
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !!..");       
    }
    const { channelId } = data
    const getSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: channelId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedToSubscriber"
                        }
                    },
                    {
                        $addFields: {
                            SubscribedToSubscriber: {
                                $cond: {
                                    $if: {
                                        $in: [channelId, "$subscribedToSubscriber.subscriber"]
                                    },
                                    then: true,
                                    else: false
                                }
                            },
                            subscriberCount: {
                                $size: "$SubscribedToSubscriber"
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$subscriber"
        },
        {
            $project: {
              _id: 0,
              subscriber: {
                _id: 1,
                username: 1,
                fullName: 1,
                "avatar.url": 1,
                subscribedToSubscriber: 1,
                subscribersCount: 1,
              },
            },
        },
    ])
    console.log("getSubscribers", getSubscribers);
    if (!getSubscribers) {
        throw new ApiError(500, "Error while fetching subscriber !!..");
    }
    return res
    .status(200)
    .json(
      new ApiResponse(200, getSubscribers, "subscribers fetched successfully")
    );
})

export const getSubscribedChannels = AsyncHandler( async(req: VerifyAuthRequest, res: Response) => {
    const { success, data } = getSubscribedChannelsSchema.safeParse(req.params)
    if (!success) {
        throw new ApiError(401, "Invalid Inputs !!..");       
    }
    const { subscriberId } = data
    const getSubscribed = await Subscription.aggregate([
        {
            $match: {
                subscriber: subscriberId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel",
                pipeline: [
                    {
                        $lookup: {
                            from: "videos",
                            localField: "_id",
                            foreignField: "owner",
                            as: "videosDetails"
                        }
                    },
                    {
                        $addFields: {
                            latestVideo: {
                                $last: "$videosDetails"
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$subscribedChannel"
        },
        {
            $project: {
                _id: 0,
                subscribedChannel: {
                _id: 1,
                username: 1,
                fullName: 1,
                "avatar.url": 1,
                latestVideo: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    createdAt: 1,
                    views: 1,
                    },
                },
            }
        }
    ])
        console.log("getSubscribed", getSubscribed);
    if (!getSubscribed) {
        throw new ApiError(500, "Error while fetching subscribed channel !!..");
    }
    return res
    .status(200)
    .json(
      new ApiResponse(200, getSubscribed, "subscribed channel fetched successfully")
    );
})

