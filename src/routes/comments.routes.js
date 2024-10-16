import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comments.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId/get-all-videoComments").get(verifyJWT,getVideoComments);
router.route("/:videoId/addComments").post(verifyJWT,addComment);
router.route("/c/:commentId/delete-comment").delete(verifyJWT,deleteComment);
router.route("/c/:commentId/update-comment").patch(verifyJWT,updateComment);

export default router