import { Subscription } from "../models/subscriptions.models.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandlers.js";


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const userId = req.user._id;     // Get the current user's ID (from authentication)  
    // Check if the like already exists for the video by this user
    const existingSubscription = await Subscription.findOne(
        { 
            channel: channelId,
            subscriber: userId
        }
    );

    if (existingSubscription) {
        // If the like exists, remove it (dislike)
        await Subscription.findByIdAndDelete(existingSubscription._id);


        return res.status(200).json({
            success: true,
            message: 'Channel unSubscribed.',
        });
    } else {
        // If the like doesn't exist, add a new like (like the video)
        const newSubscription = new Subscription({
            channel: channelId,
            subscriber: userId
        });
        await newSubscription.save();

        return res.status(200).json({
            success: true,
            message: 'Channel Subscribed successfully.',
        });
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

        // Find all likes where video is not null and likedBy is the current user
        const subscriber = await Subscription.find({
            subscriber: { $ne: null }, // Ensure the video field is not null
            channel: channelId
        }).populate('subscriber'); // Populate the video details

        if (!subscriber) {
            return res.status(201).json(
                new apiResponse(200, subscriber, "there is no any subscriber related to This Channel.")
            )
        }
        else{
            return res.status(201).json(
                new apiResponse(200, subscriber, "Subscribers fetched Successfully...!")
            )    
        }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // Find all subscriptions where the user is the subscriber
    const subscribedChannels = await Subscription.find({
        subscriber: subscriberId, // Match the subscriberId with the subscriber field in Subscription
    }).populate('channel'); // Populate the channel details (e.g., name, description)

    if (!subscribedChannels || subscribedChannels.length === 0) {
        return res.status(200).json(
            new apiResponse(200, [], "The user is not subscribed to any channels.")
        );
    }

    return res.status(200).json(
        new apiResponse(200, subscribedChannels, "Subscribed channels fetched successfully!")
    );
});

export {
    getSubscribedChannels, getUserChannelSubscribers, toggleSubscription
};

