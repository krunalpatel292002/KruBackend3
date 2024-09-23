import { User } from "../models/users.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
    console.log("email : ",email);
    if (
        [fullName, email, userName, password].some((field) =>field?.trim()==="")
    ) {
        throw new apiError(400, "All feilds are required...!");
    }
    
    const existedUser =User.findOne({
        $or:[{ userName },{ email }]
    })

    if(existedUser){
        throw new apiError(409,"User with UserName or Email already Exist..!");    
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

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

export { registerUser };
