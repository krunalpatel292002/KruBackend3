import { PlayList } from "../models/playlists.models.js";
import { Video } from "../models/videos.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";



const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description, videoIds} = req.body
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;    

    console.log(thumbnailLocalPath);
    

    if(!thumbnailLocalPath){
        throw new apiError(400,"Thumbnail file is Required.")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!thumbnail){
        throw new apiError(400,"somehow thumbnail file is not uploaded..!")   
    }

//TODO: create playlist

    // Ensure videoIds is an array
    if (!Array.isArray(videoIds) || videoIds.length === 0) {
        throw new apiError(400, "At least one video must be added to the playlist.");
    }

    // Check if all videos exist in the database
    const videos = await Video.find(
        { 
            _id: {
                    $in: videoIds 
                } 
        }
    );
    if (videos.length !== videoIds.length) {
        throw new apiError(404, "One or more videos not found.");
    }

    // Create a new playlist with the video IDs
    const playlist = await PlayList.create({
        name,
        description,
        videos: videoIds,
        owner: req.user._id,  // Assuming authentication middleware sets req.user
        thumbnail: thumbnail?.url
    });

    return res
    .status(201)
    .json(
        new apiResponse(201, playlist, "Playlist created successfully")
    );
});


const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

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
    if (userId) {
        filter = { ...filter, owner: userId };
    }

    // Set sorting order
    const sortOrder = sortType === 'asc' ? 1 : -1;

    // Fetch the videos with pagination, filtering, and sorting
    const getAllPlaylistCreatedByUser = await PlayList.find(filter)
        .sort({ [sortBy]: sortOrder }) // Dynamic sorting field
        .skip((pageNumber - 1) * limitNumber) // Pagination logic
        .limit(limitNumber); // Limit per page

    // Count total videos matching the filter
    const totalNumberOfPlayLists = await PlayList.countDocuments(filter);

    // Calculate total pages
    const totalPages = Math.ceil(totalNumberOfPlayLists / limitNumber);

    // Send the response
    return res.status(200).json({
        success: true,
        data: {
            getAllPlaylistCreatedByUser,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalNumberOfPlayLists
            }
        },
        message: "All Playlist fetched successfully!"
    });
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const playlist = await PlayList.findById(playlistId);

    if (!playlist) {
        throw new apiError(404, "playlist not found");
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, playlist, "playlist Details fetched Successfully..!")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const playlist = await PlayList.findById(playlistId);

    // Step 2: Check if the playlist exists
    if (!playlist) {
        throw new apiError(404, "Playlist not found"); // Throw an error if playlist doesn't exist
    }

    // Step 3: Check if the video already exists in the playlist to avoid duplicates
    if (playlist.videos.includes(videoId)) {
        return res.status(400).json(
            new apiResponse(400, null, "Video already exists in the playlist")
        );
    }

    // Step 4: Add the video to the playlist (push the videoId to the videos array)
    playlist.videos.push(videoId);

    // Step 5: Save the updated playlist to the database
    await playlist.save();

    // Step 6: Send a success response with the updated playlist
    return res.status(200).json(
        new apiResponse(200, playlist, "Video added to playlist successfully")
    );
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const playlist = await PlayList.findById(playlistId);

    // Step 2: Check if the playlist exists
    if (!playlist) {
        throw new apiError(404, "Playlist not found"); // Throw an error if playlist doesn't exist
    }

    // Step 3: Check if the video exists in the playlist or not.
    if (playlist.videos.includes(!videoId)) {
        return res.status(400).json(
            new apiResponse(400, null, "Video not exists in the playlist")
        );
    }

    // Step 4: Add the video to the playlist (push the videoId to the videos array)
    playlist.videos.remove(videoId);

    // Step 5: Save the updated playlist to the database
    await playlist.save();

    // Step 6: Send a success response with the updated playlist
    return res.status(200).json(
        new apiResponse(200, playlist, "Video remove from playlist successfully")
    );

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    const playlist= await PlayList.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(
        new apiResponse(200, playlist, "playlist Delete Successfully..!")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if (!name  || !description) {
        throw new apiError(400,"name or description is Required..!");
    }

    let thumbnailLocalPath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath= req.files.thumbnail[0].path;

        if (!thumbnailLocalPath) {
            throw new apiError(400, "thumbnail file is missing...");
        }

        const thumbnail =await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail.url) {
        throw new apiError(400, "Error while uploading thumbnail on cloudinary..!");
    }
    const playList = await PlayList.findByIdAndUpdate(
        req?.playlistId,
        {
            $set:{
                name,
                description: description,
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
        200, new apiResponse(200, playList, "thumbnail updated Successfully...!")
    )
    }
    else{
    const playList= await PlayList.findByIdAndUpdate(playlistId,{
        $set :{
            name,
            description: description,
            // thumbnail : thumbnail.url
        }
    }, {new:true})

    return res
    .status(200)
    .json(
        new apiResponse(200, playList, "playList Details Updated Successfully..!")
    )
}
})

export {
    addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist
};

