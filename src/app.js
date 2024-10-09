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

import userRouter from "./routes/users.routes.js";
import videoRouter from "./routes/videos.routes.js";

//Routes Declaration.

app.use("/api/v1/users", userRouter)

app.use("/api/v1/users/videos", videoRouter)




export { app };
