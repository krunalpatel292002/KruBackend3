import { Router } from "express";
import { loggedInUser, loggedOutUser, registerUser } from "../controllers/users.controllers.js";
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


export default router