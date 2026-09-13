import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config();

const connectDb=async()=>{
    try{
       await mongoose.connect(process.env.MONGODB_URI);
       console.log("mongoDb connected")
    }
    catch(error){
       console.log(`Error while connecting to mongoDb:${error}`);
    }
}
export default connectDb;