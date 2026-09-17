import { getModel } from "../config/llmModel.js"

export const router=async(state)=>{

   if(state.agent && state.agent!=="auto"){
      return{
        ...state,
        agent:state.agent
      }
   }

   if(state.file?.mimetype==="application/pdf"){
      return{
         ...state,
         agent:"pdfRag"
      }
   }
   if(state.file?.mimetype.startsWith("image/")){
      return{
         ...state,
         agent:"imageAnalyzer"
      }
   }

    const llm=await getModel("router")
   
    const prompt=`you are an agent router.
    
    

Available agents:
-chat
-search
-coding
-pdf
-ppt
imageGen

Rules:
chat:
General conversations
explanations
learning
questions

search:
current events,
latest information,
news,
recent developments,
internet lookup

coding:
Generate code,
debug code,
build projects,
architecture,
api design,

pdf:
questions about generate pdfs or document context

ppt:
questions about generate ppts or ppt context

imageGen:
Generate image
create image
modify image

Return only one word:
chat
search
coding
pdf
ppt
imageGen

User Query:${state.prompt}
`

const response=await llm.invoke(prompt);

return{
    ...state,
    agent:response.content
           .trim().toLowerCase()
}
}