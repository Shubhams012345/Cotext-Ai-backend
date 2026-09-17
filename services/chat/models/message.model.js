import mongoose from "mongoose"

const fileSchema=new mongoose.Schema({
  name:String,
  content:String
},{
  _id:false
})

const artifactSchema=new mongoose.Schema({
  id:String,
  title:String,
  type:String,
  filename:String,
  url:String,
  content:String,
  language:String,
  status:String,
  files:[fileSchema],
  createdAt:Date
},{
  _id:false
})

const attachmentSchema=new mongoose.Schema({
  name:String,
  type:String,
  size:Number,
  status:String,
  pages:Number
},{
  _id:false
})

const messageSchema=new mongoose.Schema({
      conversationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Conversation"
      },
      role:{
        type:String,
        enum:["user","assistant"]
      },
      content:{
        type:String,
        required:true
      },
      images:[String ],
      attachments:[attachmentSchema],
      artifacts:[artifactSchema]
},{timestamps:true})
const Message=mongoose.model("Message",messageSchema)
export default Message;