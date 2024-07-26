// Create a schema for users
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    userId: String,
    email: String
},{timestamps:true});

export const User = mongoose.model("User",userSchema);