import mongoose from "mongoose";
const conversationSchema=new mongoose.Schema({
    title:{
        type:String,
        default:"New chat"
    },
    userId:{
        type:String
    },
    latestMessage:{
        type:String,
        default:""
    },
    latestModel:{
        type:String,
        default:"chat"
    }
},{timestamps:true})
const Conversation=mongoose.model("Conversation",conversationSchema)
export default Conversation