import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js"

export const createConversation=async(req,res)=>{
    try{
      const userId=req.headers["x-user-id"];
      if(!userId){
        return res.status(400).json({
            success:false,
            message:"userID is required to create conversation"
        })
      }
      const conversation=await Conversation.create({
        userId:userId
      })
      res.status(200).json({
        success:true,
        message:"Conversation created successfully",
        conversation
      })
    }
    catch(err){
      res.status(500).json({
        success:false,
        message:`Error while creating conversation ${err}`
      })
    }
}

export const updateConversation=async(req,res)=>{
    try{
       const{id,title}=req.body;
       if(!id ||!title){
         res.status(400).json({
            success:false,
            message:"All fields are required to update conversation"
         })
       }
       const conversation=await Conversation.findOne(id,{
        title,
       })
       res.status(200).json({
        success:true,
        message:"Conversation updated successfully",
        conversation
      })
    }
    catch(err){
         res.status(500).json({
        success:false,
        message:`Error while updating conversation ${err}`
      })
    }
    
}

export const getConversation=async(req,res)=>{
    try{
      const userId=req.headers["x-user-id"];
      if(!userId){
        return res.status(400).json({
            success:false,
            message:"userID is required to get the conversation"
        })
      }
      const conversation=await Conversation.find({
        userId:userId
      }).sort({updatedAt:-1})
      res.status(200).json({
        success:true,
        message:"Conversation fetched successfully",
        conversation
      })
    }
    catch(err){
      res.status(500).json({
        success:false,
        message:`Error while fetching conversation ${err}`
      })
    }
}

export const saveMessage=async(req,res)=>{
    try{
        const{conversationId,role,content,images,artifacts}=req.body;
        if(!conversationId ||!role ||!content){
            return res.status(400).json({
                success:false,
                message:"All fields are required to save message"
            })
        }
        const message=await Message.create({
            conversationId,role,content,images,artifacts
        })
        res.status(200).json({
        success:true,
        message
      })
    }
    catch(err){
         res.status(500).json({
        success:false,
        message:`Error while saving message ${err}`
      })
    }
}
export const getMessage=async(req,res)=>{
    try{
     
      const messages=await Message.find({
        conversationId:req.params.conversationId    
      }).sort({createdAt:-1})
      res.status(200).json({
        success:true,
        message:"Message fetched successfully",
        messages
      })
    }
    catch(err){
         res.status(500).json({
        success:false,
        message:`Error while saving message ${err}`
      })
    }
}