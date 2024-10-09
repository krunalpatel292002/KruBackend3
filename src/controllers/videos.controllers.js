import { Video } from "../models/videos.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";



    //TODO: get all videos based on query, sort, pagination

//---------------------------------------------------------------
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

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
                { title: { $regex: query, $options: "i" } }, // case-insensitive search
                { description: { $regex: query, $options: "i" } }
            ]
        };
    }

    // Optionally filter by userId if provided
    if (userId) {
        filter = { ...filter, owner: userId };
    }

    // Filter out unpublished videos (if you want to show only published videos)
    filter = { ...filter, isPublished: true };

    // Set sorting order
    const sortOrder = sortType === 'asc' ? 1 : -1;

    // Fetch the videos with pagination, filtering, and sorting
    const videos = await Video.find(filter)
        .sort({ [sortBy]: sortOrder }) // Dynamic sorting field
        .skip((pageNumber - 1) * limitNumber) // Pagination logic
        .limit(limitNumber); // Limit per page

    // Count total videos matching the filter
    const totalVideos = await Video.countDocuments(filter);

    // Calculate total pages
    const totalPages = Math.ceil(totalVideos / limitNumber);

    // Send the response
    return res.status(200).json({
        success: true,
        data: {
            videos,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalVideos
            }
        },
        message: "Videos fetched successfully!"
    });
});

//---------------------------------------------------------------


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    //---------------------------------------------------------------------

    // console.log("response of req.files from ||videos.controllers.js||: ", req.files);

    const videoLocalPath = req.files?.videoFile[0]?.path;    
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;    

    
    if(!videoLocalPath){
        throw new apiError(400,"Video file is Required")
    }

    if(!thumbnailLocalPath){
        throw new apiError(400,"Thumbnail file is Required")
    }


    const video = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    // console.log("video :",video);
    // console.log("thumbnail :",thumbnail);
    

    if(!video){
        throw new apiError(400,"somehow video file is not uploaded..!")   
    }

    if(!thumbnail){
        throw new apiError(400,"somehow thumbnail file is not uploaded..!")   
    }

    // owner = getCurrentUser(userId)._id;
     // Extract duration from Cloudinary response (if available)
     const videoDuration = video.resource_type === 'video' ? video.duration : null;

     if (!videoDuration) {
         throw new apiError(400, "Unable to retrieve video duration from Cloudinary response.");
     }

    const videoFile =await Video.create({
        title,
        videoFile: video.url,
        thumbnail: thumbnail?.url,
        description,
        // duration: video.metadata.duration(video.url),
        duration: videoDuration,
        // owner : owner
    })

    const createdVideoFile = await Video.findById(videoFile._id);

    if(!createdVideoFile){
        apiError(500,"Something went wrong while creating the Video.")
    }

    return res.status(201).json(
        new apiResponse(200, createdVideoFile, "Video Created & Uploaded SuccessFully on MONGO DB..!")
    )

    //---------------------------------------------------------------------
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.findById(videoId);

    if (!video) {
        throw new apiError(404, "Video not found");
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, video, "Video Details fetched Successfully..!")
    )
})

const updatethumbnailVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const thumbnailLocalPath = req.file?.path

    if (!thumbnailLocalPath) {
        throw new apiError(400, "Avatar file is missing...");
    }

    const thumbnail =await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail.url) {
        throw new apiError(400, "Error while uploading avatar on cloudinary..!");
    }

    const video = await Video.findByIdAndUpdate(
        req?.videoId,
        {
            $set:{
                thumbnail : thumbnail.url
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(
        200, new apiResponse(200, video, "thumbnail updated Successfully...!")
    )
})

const updateVideoDetails = asyncHandler(async (req,res) => {

    const { videoId } = req.params

    const {title, description}=req.body;

    console.log("title", title);
    

    if (!title  || !description) {
        throw new apiError(400,"title or description is Required..!");
    }

    const video= await Video.findByIdAndUpdate(videoId,{
        $set :{
            title,
            description: description,
        }
    }, {new:true})

    return res
    .status(200)
    .json(
        new apiResponse(200, video, "video Details Updated Successfully..!")
    )
})



const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const video= await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json(
        new apiResponse(200, video, "video Delete Successfully..!")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params


    // Find the video by its ID
    const video = await Video.findById(videoId);

    // Check if the video exists
    if (!video) {
        throw new apiError(404, "Video not found");
    }

    // Toggle the `isPublished` status
    video.isPublished = !video.isPublished;

    // Save the updated video back to the database
    await video.save();

    // Return a success response
    return res.status(200).json(
        new apiResponse(200, video, `Video has been ${video.isPublished ? "published" : "unpublished"} successfully!`)
    );
});
    


export {
    deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updatethumbnailVideo, updateVideoDetails
};

