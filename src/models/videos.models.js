import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema(
    {
        videoFile:{
            type:String,  //cloudnerry URL.
            required: true,
        },
        thumbnail:{
            type:String,  //cloudnerry URL.
            required: true,
        },
        title:{
            type:String,  
            required: true,
        },
        description:{
            type:String,  
            required: true,
        },
        duration:{
            type: Number,  //cloudnerry URL.
            required: true,
        },
        views:{
            type: Number,
            default: 0
        },
        isPublished:{
            type: Boolean,
            default: true
        },
        owner:{
            type: mongoose.Types.ObjectId,
            ref: 'User'
        },
        likesCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)