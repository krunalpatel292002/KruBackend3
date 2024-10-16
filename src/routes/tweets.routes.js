import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweets.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/create-tweet/:userId").post(createTweet);
router.route("/user/:userId/get-tweets").get(getUserTweets);
router.route("/:tweetId/update-tweet").patch(updateTweet)
router.route("/:tweetId/delete-tweet").delete(deleteTweet);

export default router