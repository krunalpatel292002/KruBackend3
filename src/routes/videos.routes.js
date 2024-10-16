import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updatethumbnailVideo, updateVideoDetails
} from "../controllers/videos.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file


router
    .route("/all-videos")
    .get(getAllVideos)

router
    .route("/upload-video")
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },    
        ]),
        publishAVideo
    );

router.route("/:videoId").get(getVideoById)

router.route("/:videoId/delete-video").delete(deleteVideo)

router.route("/:videoId/update-thumbnail").patch(upload.single("thumbnail"), updatethumbnailVideo);

router.route("/:videoId/update-videoDetails").patch( updateVideoDetails);

router.route("/toggle/publish/:videoId/publish-status").patch(togglePublishStatus);

export default router