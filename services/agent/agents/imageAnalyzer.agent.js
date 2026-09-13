import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModel"
import fs from "fs"
import { checkAgentLimit } from "../config/agentLimit.js"
export const imageAnalyzer=async()=>{
     try{
        await checkAgentLimit(state.userId,"imageGen")
           const llm=await getModel("pdfRag")
        const imageBuffer=await fs.readFile(state.file.path)
        const base64image=imageBuffer.toString("base64")
    
        const messages=[
            new SystemMessage(
                `You are cotextAi image analyzer agent.
                
            Rules:
            -Analyze the uploaded image
            -Answer the user's question accurately
            -if text exists in the image extract it.
            -if charts or table exists then explain them.
            -if something is uncler ,say so.
            -use markdown when helpful.
            -Do not hallucinate.`
            ),
            new HumanMessage(
                {
                    content:[
                        {
                            type:"text",
                            text:state.prompt ||"anlyze the image"
                        },
                        {
                            type:"image_url",
                            "image_url":{
                               url:`data:${state.file.mimetype};base64,${base64image}`
                            }
                        }
                    ]
                }
            )
        ]
        const response=await llm.invoke(messages)
         await deductCredits(state.userId,"imageGen")
        
        return{
            ...state,
            aiResponse:response.content
        }
       }
       catch(err){
        console.log(err)
        return {
            ...state,
            aiResponse:"Failed to Analyze file"
        }
    
       }
       finally{
        fs.unlink(state.file.path)
       }
}