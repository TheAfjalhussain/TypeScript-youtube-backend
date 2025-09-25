import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

interface IVideoSchema {
    videoFile: any,
    thumbnail: any,
    title: string
    description: string,
    duration: number,
    views: number,
    isPublished: boolean
    owner: mongoose.Schema.Types.ObjectId
}

const videoSchema = new Schema<IVideoSchema>(
    {
        videoFile: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            required: true
        },
        isPublished: {
            type: Boolean,
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model<IVideoSchema>("Video", videoSchema)