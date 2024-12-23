import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema =  new Schema(
    {
        content: {
            type: String,
            require: true
        },
        video:{
            type: Schema.Types.ObjectId,
            ref:"Videos"
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref:"User"
        },
        likesCount: {
            type: Number,
            default: 0,
        }
    },
    {
        timestamps: true,
    }
);


commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment", commentSchema)