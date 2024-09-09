import bcrypt from 'bcrypt';
import mongoose, { Schema } from "mongoose";

const userSchema = new userSchema({
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase:true ,
        trim: true,
        index:true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase:true ,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index:true
    },
    avatar: {
        type: String,  //cloudnary URL.
        required: true,
    },
    coverImage:{
        type: String,  //cloudnary URL.
    },
    watchHistory:[{
        type: Schema.Types.ObjectId,
        ref: "video"
    }],
    password:{
        type:String,
        required:[true,"password is Required"],
    },
    refreshToken:{

    }

},{
    timestamps: true
})


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    
    this.password = bcrypt.hash(this.password, 10)
    next()
    
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function () {
    JsonWebTokenError.sign({
        _id : this._id,
        email: this.email,
        userName:this.userName,
        fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}


userSchema.methods.generateRefreshToken = function () {
    JsonWebTokenError.sign({
        _id : this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}

export const User= mongoose.model("User", )