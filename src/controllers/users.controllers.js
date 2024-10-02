import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/users.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateRefreshTokenAndAccessTokens = async(userId) =>{
    try {
        const user = await User.findById(userId);
        console.log("-------------------------------------------------");
        
        console.log("user:", user);
        
        const accessToken = user.generateAccessToken();
        console.log("-------------------------------------------------------------");
        console.log("accessToken : ", accessToken);
        

        const refreshToken= user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return {accessToken, refreshToken}


    } catch (error) {
        throw new apiError(500,"Something went wrong while Generating RefreshToken And Accesstoken.");
        
    }
} 

const registerUser = asyncHandler(async (req, res) => {
    //get user Details From Frontend.
    //validation-not Empty.
    //check if User already Exists: userName, email, Phone.
    //check for Images, Checks For Avatar.
    //upload them to Cloudinary, Avatar
    //Create User Object.-Create Entry in DB.
    //remove Password & Refresh Token Fields from response.
    //check for user Creation.
    //return res.

    const {fullName, email, userName, password}=req.body
    // console.log("email : ",email);
    console.log("response of req.body from ||users.controllers.js|| :", req.body);
    
    if (
        [fullName, email, userName, password].some((field) =>field?.trim()==="")
    ) {
        throw new apiError(400, "All feilds are required...!");
    }
    
    const existedUser = await User.findOne({
        $or:[{ userName },{ email }]
    })

    if(existedUser){
        throw new apiError(409,"User with UserName or Email already Exist..!");    
    }

    // console.log("response of req.files from ||users.controllers.js||: ", req.files);
    
    const avatarLocalPath = req.files?.avatar[0]?.path;    
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath= req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new apiError(400,"avatar file is Required")
        
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new apiError(400,"avatar file is Required")
    }

    const user=await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName : userName.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        apiError(500,"Something went wrong while registering the User.")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "user registered SuccessFully..!")
    )
})

const loggedInUser = asyncHandler(async (req,res) => {
    //req.body --> data
    //userName or Email
    //Check or Find the User.
    //if available then Password.
    //if password true then Refresh token & Access Token.
    //send in Coockies Securely.
    //
    console.log(req.body);
    
    const { email, userName, password } = req.body;
    if(!email && !userName){
        throw new apiError(400, "userName or Email is Required.");    
    }
    //Here is an Alternative Logic of Above Logic.
    // if(!(email || userName)){
    //     throw new apiError(400, "userName or Email is Required.");    
    // }

    const user = await User.findOne({
        $or : [{userName}, {email}]
    })
    console.log("-------------------------------");
    console.log(user);
    
    

    if (!user) {
        throw new apiError(404, "User does not exist.");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new apiError(401, "Invalid User Credentials...");
        
    }

    const {accessToken, refreshToken} = await generateRefreshTokenAndAccessTokens(user._id);
    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken");
    // console.log(loggedInUser);
    

    const options = {
        httpOnly :true,
        secure :true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200,{
                user: loggedInUser, refreshToken, accessToken
            },
            "User Logged in Successfully."
        )
    )
})

const loggedOutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken: undefined
            }
        },
        {
            new :true
        }
    )

    const options = {
        httpOnly :true,
        secure :true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new apiResponse(201, {}, "Successfully Logged-Out!")
    )
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new apiError(401, "Unauthorized request...!");
    }
try {
        const decodedToken= jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user=await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new apiError(401, "Invalid RefreshToken");
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new apiError("refreshToken is Expired or Used.");
            
        }
    
        const options = {
            httpOnly :true,
            secure: true
        }
    
        const {accessToken, newRefreshToken}=await generateRefreshTokenAndAccessTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new apiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "accessToken Refreshed Successfully."
            )
        )
} catch (error) {
    throw new apiError(401, error?.message || "Invalid RefreshToken");
}
})

const changeCurrentUserPassword = asyncHandler(async (req, res) => {
    const { oldPassword , newPassword }= req.body;
    // const { oldPassword , newPassword , confirmPassword }= req.body;


    // if (!(newPassword === confirmPassword)) {
    //     throw new apiError(400,"New-Password & Current-Passwords are not Matched.");
        
    // }

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new apiError(400,"Invalid oldPassword.");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new apiResponse(200, {}, "Password Successfully Changed...!"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(
        new apiResponse(200, res.user,"Current User Successfully Fetched.")
    )
})


const updateAccountDetail = asyncHandler(async (req, res) => {
    const {fullName, email} = req.body;

    if (!fullName  || !email) {
        throw new apiError(400,"fullName or Email is Required..!");
    }

    const user= await User.findByIdAndUpdate(req.user?._id,{
        $set :{
            fullName,
            email: email,
        }
    }, {new:true}).select("-password")

    return res
    .status(200)
    .json(
        new apiResponse(200, user, "Account Details Updated Successfully..!")
    )
})

const updatedUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is missing...");
    }

    const avatar =await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new apiError(400, "Error while uploading avatar on cloudinary..!");
    }

    //TO DO: delete old image.-assignment 
    //May be using unlink().

    await User.findByIdAndUpdate(
        req?.user._id,
        {
            $set:{
                avatar : avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        200, new apiResponse(200, user, "Avatar uploaded Successfully...!")
    )
})

const updatedUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new apiError(400, "CoverImage file is missing...");
    }

    const coverImage =await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new apiError(400, "Error while uploading coverImage on cloudinary..!");
    }

    await User.findByIdAndUpdate(
        req?.user._id,
        {
            $set:{
                coverImage : coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        200, new apiResponse(200, user, "CoverImage uploaded Successfully...!")
    )
})

const getUserChannelProfile = asyncHandler(async (req,res) => {
    const {userName} = req.params;

    if(!userName?.trim()){
        throw new apiError(400,"UserName is Missing.");
    }

    const channel = await User.aggregate([
        {
            $match:{
                userName : userName?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount :{
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed:{
                    $cond: {
                        if: {
                            $in: [req.user?._id,"$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                userName:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage: 1,
                email: 1
            }
        }
    ])
    console.log(channel);
    if (!channel?.length) {
        throw new apiError(404,"channel Does Not Exist.");
    }
    
    return res
    .status(200)
    .json(
        new apiResponse(200, channel[0], "User Channel Fetched SuccessFully.")
    )
})

const getWatchHistory = asyncHandler(async(req, res)=> {
    const user = await User.aggregate([
        {
            $match:{
                _id : new mongoose.Types.ObjectId(req.user._id),

            }
        },
        {
            $lookup : {
                from : "Videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from : "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1, 
                                        userName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new apiResponse(200, user[0].watchHistory,
            "watch History Fetched SuccessFully."
        )
    )
})

export {
    changeCurrentUserPassword,
    getCurrentUser, getUserChannelProfile, getWatchHistory, loggedInUser,
    loggedOutUser,
    refreshAccessToken, registerUser, updateAccountDetail, updatedUserAvatar, updatedUserCoverImage
};

