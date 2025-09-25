import mongoose, { Schema } from "mongoose";

interface ISubscription {
    subscriber: any,
    channel: any
}

const subscreptionSchema = new Schema<ISubscription>(
    {
        subscriber: {  // one who is subscribing
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        channel: { // one whom subscriber is subscrinbing
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

export const Subscription = mongoose.model<ISubscription>("Subscription", subscreptionSchema)