import mongoose, { Schema } from "mongoose";

interface ITweet {
    owner: Schema.Types.ObjectId,
    content: string
}

const tweetSchema = new Schema<ITweet>(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        content: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export const Tweet = mongoose.model<ITweet>("Tweet", tweetSchema)