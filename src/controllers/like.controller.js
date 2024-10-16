import { Comment } from "../models/comments.models.js";
import { Like } from "../models/likes.models.js";
import { Video } from "../models/videos.models.js";
import { asyncHandler } from "../utils/asyncHandlers.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    // Find the video by its ID
    
    const userId = req.user._id;     // Get the current user's ID (from authentication)  
    // Check if the like already exists for the video by this user
    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });
    
    if (existingLike) {
        // If the like exists, remove it (dislike)
        await Like.findByIdAndDelete(existingLike._id);

        // Decrement the like count in the Video model (assuming there is a like counter)
        await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: -1 } }, { new: true });

        return res.status(200).json({
            success: true,
            message: 'Like removed (disliked).',
        });
    } else {
        // If the like doesn't exist, add a new like (like the video)
        const newLike = new Like({
            video: videoId,
            likedBy: userId,
        });
        await newLike.save();

        // Increment the like count in the Video model
        await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: 1 } }, { new: true });

        return res.status(200).json({
            success: true,
            message: 'Video liked successfully.',
        });
    }
});



const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId = req.user._id;     // Get the current user's ID (from authentication)  
    // Check if the like already exists for the video by this user
    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });
    
    if (existingLike) {
        // If the like exists, remove it (dislike)
        await Like.findByIdAndDelete(existingLike._id);

        // Decrement the like count in the Video model (assuming there is a like counter)
        await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: -1 } }, { new: true });

        return res.status(200).json({
            success: true,
            message: 'Like removed (disliked).',
        });
    } else {
        // If the like doesn't exist, add a new like (like the video)
        const newLike = new Like({
            comment: commentId,
            likedBy: userId,
        });
        await newLike.save();

        // Increment the like count in the Video model
        await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: 1 } }, { new: true });

        return res.status(200).json({
            success: true,
            message: 'Comment liked successfully.',
        });
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    getLikedVideos, toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike
};

