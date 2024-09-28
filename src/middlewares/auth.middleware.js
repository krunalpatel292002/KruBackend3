import jwt from "jsonwebtoken";
import { User } from "../models/users.models.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandlers.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken  || req.header("authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new apiError(401,"Unauthorized User...!");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            //Next Video: discuss about Frontend.
            throw new apiError("Invalid Access Token..!");   
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new apiError(401,error?.message || "Invalid Access Token..!");
        
    }
});