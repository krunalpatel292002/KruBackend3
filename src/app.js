import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';



const app= express()
 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,

}))

app.use(express.json({limit:"16KB"}))
app.use(express.urlencoded({
    extended:true,
    limit:"16KB"
}))
app.use(express.static("Public"))
app.use(cookieParser())


//Routes import

import { healthcheck } from './controllers/healthcheck.controller.js';
import commentRouter from "./routes/comments.routes.js";
import likeRouter from "./routes/likes.routes.js";
import playlistRouter from "./routes/playlists.routes.js";
import tweetRouter from "./routes/tweets.routes.js";
import userRouter from "./routes/users.routes.js";
import videoRouter from "./routes/videos.routes.js";



//Routes Declaration.

app.use("/api/v1/users", userRouter)

app.use("/api/v1/tweets", tweetRouter)


app.use("/api/v1/healthCheck", healthcheck)

app.use("/api/v1/videos", videoRouter)

app.use("/api/v1/likes", likeRouter )

app.use("/api/v1/comments", commentRouter)

app.use("/api/v1/playlist", playlistRouter)


export { app };
