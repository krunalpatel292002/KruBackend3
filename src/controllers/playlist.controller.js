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
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist
};

