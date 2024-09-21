import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema(
    {
        videoFile:{
            type:string,  //cloudnerry URL.
            required: true,
            
        },
        thumbnail:{
            type:string,  //cloudnerry URL.
            required: true,
        },
        title:{
            type:string,  
            required: true,
        },
        description:{
            type:string,  
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
        }
    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Videos = mongoose.model("Video", videoSchema)