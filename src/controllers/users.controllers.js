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
    .json(201, {}, "Successfully Logged-Out!")
})

export { loggedInUser, loggedOutUser, registerUser };

