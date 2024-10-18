import { Like } from '../models/likes.models.js';
import { Subscription } from '../models/subscriptions.models.js';
import { Video } from '../models/videos.models.js';
import { asyncHandler } from "../utils/asyncHandlers.js";


    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Fetch total videos uploaded by the channel
    const totalVideos = await Video.countDocuments({ uploadedBy: channelId });

    // Fetch total subscribers of the channel
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    // Fetch total likes across all videos uploaded by the channel
    const totalLikes = await Like.countDocuments({ video: { $in: await Video.find({ uploadedBy: channelId }).select('_id') }});

    // Fetch total views across all videos uploaded by the channel
    const totalViews = await Video.aggregate([
        { $match: { uploadedBy: channelId } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);

    const stats = {
        totalVideos,
        totalSubscribers,
        totalLikes,
        totalViews: totalViews[0]?.totalViews || 0
    };

    return res.status(200).json({ success: true, data: stats });
})

// TODO: Get all the videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Fetch all videos uploaded by the channel
    const videos = await Video.find({ uploadedBy: channelId }).sort({ createdAt: -1 }); // Sort by most recent

    if (!videos || videos.length === 0) {
        return res.status(404).json({ success: false, message: "No videos found for this channel" });
    }
    return res.status(200).json({ success: true, data: videos });        
})

export {
    getChannelStats,
    getChannelVideos
};

