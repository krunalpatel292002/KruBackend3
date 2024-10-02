import { Router } from "express";
import { changeCurrentUserPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loggedInUser, loggedOutUser, refreshAccessToken, registerUser, updateAccountDetail, updatedUserAvatar, updatedUserCoverImage } from "../controllers/users.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser);

router.route("/login").post(loggedInUser)

//secured Routes.

router.route("/logout").post(verifyJWT, loggedOutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT,changeCurrentUserPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-account").patch(verifyJWT, updateAccountDetail)


router.route("/avatar").patch(verifyJWT, upload.single("avatar"),updatedUserAvatar)

router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updatedUserCoverImage)

router.route("/c/:userName").get(verifyJWT, getUserChannelProfile)

router.route("/history").patch(verifyJWT,getWatchHistory)


export default router