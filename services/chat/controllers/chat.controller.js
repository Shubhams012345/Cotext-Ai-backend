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
       const userId=req.headers["x-user-id"];
       if(!id ||!title?.trim()){
         return res.status(400).json({
            success:false,
            message:"All fields are required to update conversation"
         })
       }
       const conversation=await Conversation.findOneAndUpdate(
        { _id:id, userId },
        { title: title.trim() },
        { new:true }
       )
       if(!conversation){
         return res.status(404).json({
           success:false,
           message:"Conversation not found"
         })
       }

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

export const deleteConversation=async(req,res)=>{
    try{
      const userId=req.headers["x-user-id"];
      const conversation=await Conversation.findOneAndDelete({
        _id:req.params.id,
        userId
      });
      if(!conversation){
        return res.status(404).json({success:false,message:"Conversation not found"});
      }
      await Message.deleteMany({conversationId:conversation._id});
      return res.status(200).json({
        success:true,
        message:"Conversation deleted successfully"
      });
    }
    catch(err){
      return res.status(500).json({
        success:false,
        message:`Error while deleting conversation ${err}`
      });
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
      const conversations=await Conversation.find({
        userId:userId
      }).sort({updatedAt:-1})

      const enriched = await Promise.all(conversations.map(async (conversation) => {
        const latestMessageDoc = await Message.findOne({ conversationId: conversation._id }).sort({ createdAt: -1 }).lean();
        const latestMessage = latestMessageDoc?.content?.trim() || conversation.latestMessage || "";
        const preview = latestMessage ? latestMessage.replace(/\s+/g, " ").trim() : "";

        return {
          ...conversation.toObject(),
          latestMessage: preview.length > 180 ? `${preview.substring(0, 177)}...` : preview,
          latestModel: conversation.latestModel || latestMessageDoc?.role || "chat",
          updatedAt: conversation.updatedAt || latestMessageDoc?.updatedAt || conversation.createdAt,
        }
      }))

      res.status(200).json({
        success:true,
        message:"Conversation fetched successfully",
        conversation: enriched
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
        const{conversationId,role,content,images,artifacts,attachments,latestModel}=req.body;
        if(!conversationId ||!role ||!content){
            return res.status(400).json({
                success:false,
                message:"All fields are required to save message"
            })
        }
        const message=await Message.create({
            conversationId,role,content,images,artifacts,attachments  
        })
        await autoUpdateConversationTitle(
            conversationId,
            role,
            content
        );
        await updateConversationPreview(conversationId, role, content, latestModel);
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
      }).sort({createdAt:1})
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

const autoUpdateConversationTitle = async (
    conversationId,
    role,
    content
) => {
    if (role !== "user") return;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) return;

    if (conversation.title !== "New chat") return;

    await Conversation.findByIdAndUpdate(conversationId, {
        title:
            content.length > 45
                ? content.substring(0, 45) + "..."
                : content,
    });
};

const updateConversationPreview = async (conversationId, role, content, latestModel) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return;

    const nextContent = String(content || "").replace(/\s+/g, " ").trim();
    if (!nextContent) return;

    await Conversation.findByIdAndUpdate(conversationId, {
        latestMessage: nextContent.length > 180 ? `${nextContent.substring(0, 177)}...` : nextContent,
        latestModel: latestModel || (role === "assistant" ? "assistant" : "chat"),
        updatedAt: new Date(),
    });
};