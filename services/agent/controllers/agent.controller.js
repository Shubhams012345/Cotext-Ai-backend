import { Graph } from "@langchain/core/runnables/graph"
import { addMessage } from "../config/memory"

export const agent=async(req,res,next)=>{
    try{
      const {prompt,conversationId,agent}=req.body
      const {userId}=req.headers["x-user-id"]
      const file=req.file
      
      await axios.post(`${process.env.CHAT_SERVICE}/save-message`,{
        conversationId,role:"user",content:prompt
      })
      const result=await Graph.invoke({
        prompt,conversationId,agent,userId,file
      })
      const response=result?.aiResponse
      await addMessage(conversationId,"user",prompt)
      await addMessage(conversationId,"assistant",response)
       await axios.post(`${process.env.CHAT_SERVICE}/save-message`,{
        conversationId,role:"assistant",content:response,images:result?.images,artifacts:result?.artifacts
      })
      res.status(200).json({
        answer:response,
        images:result?.images,
        artifacts:result?.artifacts
      })
    }
    catch(err){
      next(err)
    }
}