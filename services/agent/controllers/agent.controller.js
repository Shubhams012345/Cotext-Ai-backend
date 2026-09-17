import axios from "axios";
import { Graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";

export const agent=async(req,res,next)=>{
    try{
      const {prompt,conversationId,agent}=req.body
      const userId=req.headers["x-user-id"]
      const file=req.file
      const attachment=file ? {
        name:file.originalname,
        type:file.mimetype,
        size:file.size,
        status:"completed"
      } : undefined
      
      await axios.post(`${process.env.CHAT_SERVICE}/api/chatRoutes/save-message`,{
        conversationId,
        role:"user",
        content:prompt,
        attachments:attachment ? [attachment] : [],
        latestModel: agent
      })
      
      const result=await Graph.invoke({
        prompt,conversationId,agent,userId,file,
      })
    
      const response=result?.aiResponse
    
      await addMessage(conversationId,"user",prompt)
  
      await addMessage(conversationId,"assistant",response)
      await axios.post(`${process.env.CHAT_SERVICE}/api/chatRoutes/save-message`,{
        conversationId,
        role:"assistant",
        content:response,
        images:result?.images,
        artifacts:result?.artifacts,
        latestModel: result?.agent || agent
      })

      res.status(200).json({
        answer:response,
        images:result?.images,
        artifacts:result?.artifacts,
        agent:result?.agent
      })
     
    }
    catch(err){
      next(err)
    }
}