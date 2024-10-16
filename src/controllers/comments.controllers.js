import { Comment } from "../models/comments.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandlers.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId }=req.params;

    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc' } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    
    // Create a base filter object to store the conditions
    let filter = {};

    // Filter by search query (e.g., in title or description)
    if (query) {
        filter = {
            ...filter,
            $or: [
                { content : { $regex: query, $options: "i" } }, // case-insensitive search
            ]
        };
    }

    // Optionally filter by userId if provided
    if (videoId) {
        filter = { ...filter, video: videoId };
    }

    // Filter out unpublished videos (if you want to show only published videos)
    filter = { ...filter, isPublished: true };

    // Set sorting order
    const sortOrder = sortType === 'asc' ? 1 : -1;

    // Fetch the videos with pagination, filtering, and sorting
    const getAllComment = await Comment.find(filter)
        .sort({ [sortBy]: sortOrder }) // Dynamic sorting field
        .skip((pageNumber - 1) * limitNumber) // Pagination logic
        .limit(limitNumber); // Limit per page

    // Count total videos matching the filter
    const totalComments = await Comment.countDocuments(filter);

    // Calculate total pages
    const totalPages = Math.ceil(totalComments / limitNumber);

    // Send the response
    return res.status(200).json({
        success: true,
        data: {
            getAllComment,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalComments
            }
        },
        message: "All Comments fetched successfully!"
    });
});


const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params

    const { content} = req.body

    if (!content) {
        throw new apiError(400,"Please Add some Content in Comments.");
    }

    const createComment =await Comment.create({
        content: content,
        video: videoId,   
    })

    if(!createComment){
        apiError(500,"Something went wrong while creating the Comment.")
    }

    return res.status(201).json(
        new apiResponse(200, createComment, "Comment Created & Uploaded SuccessFully on MONGO DB..!")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {CommentId} = req.params
        
    const {content}=req.body;

    console.log("content", content);
    

    if (!content) {
        throw new apiError(400,"content is Required..!");
    }

    const updatedComment= await Comment.findByIdAndUpdate(CommentId,{
        $set :{
            content: content
        }
    }, {new:true})

    return res
    .status(200)
    .json(
        new apiResponse(200, updatedComment, "comment content Updated Successfully..!")
    )
})


const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {CommentId} = req.params

    const deletedComment= await Comment.findByIdAndDelete(CommentId)

    return res
    .status(200)
    .json(
        new apiResponse(200, deletedComment, "comment deleted Successfully..!")
    )

})

export {
    addComment, deleteComment, getVideoComments, updateComment
};

