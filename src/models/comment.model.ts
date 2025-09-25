import mongoose, { Schema,} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


interface IComment {
    content: string,
    video: Schema.Types.ObjectId
    owner: Schema.Types.ObjectId
}

const commentSchema = new Schema<IComment>(
    {
        content: {
            type: String,
            required: true,
            trim: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true
        }
    },
    {
        timestamps: true
    }
)

commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model<IComment>("Comment", commentSchema)