import mongoose from 'mongoose';

let uri = process.env.MONGODB_URI;
export const connectDB = async () => {
    try{
        const connection=await mongoose.connect(uri)
        console.log('MongoDB Connected');
        return 

    }
    catch(err)
    {
        throw new Error("DB Connection Failed",err)
    }
}