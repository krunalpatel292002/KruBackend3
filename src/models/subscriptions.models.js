import mongoose, {Schema} from "mongoose";
import { User } from "./users.models.js";
import { asyncHandler } from "../utils/asyncHandlers.js";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, //the One who is Subscribing.
        ref : "User"
    },
    channel: {
        type: Schema.Types.ObjectId, //the One whom the Subscriber is Subscribing.
        ref : "User"
    }
}, {
    timestamps: true
});



export const Subscription = mongoose.model("Subscription", subscriptionSchema)