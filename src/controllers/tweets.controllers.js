import { Tweet } from "../models/tweets.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandlers.js";


const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {userId} = req.params

    if (!userId) {
        throw new apiError(400,"Please Add userId in params");
    }

    const { content } = req.body

    if (!content) {
        throw new apiError(400,"Please Add some Content in Tweet.");
    }

    const createTweet =await Tweet.create({
        content: content,
        owner: userId,   
    })

    if(!createTweet){
        apiError(500,"Something went wrong while creating the Tweet.")
    }

    return res.status(201).json(
        new apiResponse(200, createTweet, "Comment Created & Uploaded SuccessFully on MONGO DB..!")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId }=req.params;

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
    const getAllTweets = await Tweet.find(filter)
        .sort({ [sortBy]: sortOrder }) // Dynamic sorting field
        .skip((pageNumber - 1) * limitNumber) // Pagination logic
        .limit(limitNumber); // Limit per page

    // Count total videos matching the filter
    const totalTweets = await Tweet.countDocuments(filter);

    // Calculate total pages
    const totalPages = Math.ceil(totalTweets / limitNumber);

    // Send the response
    return res.status(200).json({
        success: true,
        data: {
            getAllTweets,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalTweets
            }
        },
        message: "All Tweets fetched successfully!"
    });
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const {TweetId} = req.params
        
    const {content}=req.body;

    console.log("content", content);
    

    if (!content) {
        throw new apiError(400,"content is Required..!");
    }

    const updatedTweetContent= await Tweet.findByIdAndUpdate(TweetId,{
        $set :{
            content: content
        }
    }, {new:true})

    const updatedTweet = await Tweet.findById(TweetId);

    return res
    .status(200)
    .json(
        new apiResponse(200, updatedTweet, "comment content Updated Successfully..!")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {TweetId} = req.params

    const deletedTweet= await Tweet.findByIdAndDelete(TweetId)

    return res
    .status(200)
    .json(
        new apiResponse(200, deletedTweet, "tweet deleted Successfully..!")
    )
})

export {
    createTweet, deleteTweet, getUserTweets,
    updateTweet
};

