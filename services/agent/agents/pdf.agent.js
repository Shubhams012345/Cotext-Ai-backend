import { getModel } from "../config/llmModel.js"
import { genratePdf } from "../utils/genratePdf.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"
import { uploadToS3 } from "../utils/uploadTos3.js"
export const pdfAgent=async(state)=>{
    try{
        await checkAgentLimit(state.userId,"pdf")
     const llm=await getModel("pdf")
     const res=await llm.invoke(`
        You are an expert document writer.

        Return only valid JSON.
        Do not return markdown.
        Do not return explanations.

        structure:
        {
        "title":"",
        "subtitle":"",
        "sections":[
        {
        "heading":"",
        "points":[]
        }
        ]
        }
        Generate 4-8 sections.
        Each section should have 3-6 concise bullet points.
        Topic:
        ${state.prompt}
        `)

       
        const data=JSON.parse(res.content);
        await deductCredits(state.userId,"pdf")

        const pdfBuffer=await genratePdf(data)

        const filename=`pdf-${Date.now()}.pdf`

        await uploadToS3(filename,pdfBuffer,"application/pdf")
        console.log("Uploaded Successfully");
        const downloadUrl=await getFromS3(filename,24*60 )

        return {
            ...state,
            aiResponse:`# PDF Genrated
            
            **${data.title}**
            
            📩 [Download pdf](${downloadUrl})
            
            ⌛_Link expires in 10 minutes._   `
            ,artifacts:[{
              id:filename,
              title:data.title || "Generated PDF",
              type:"PDF",
              filename,
              url:downloadUrl,
              status:"ready",
              createdAt:new Date()
            }]
        }

    }
    catch(err){
       console.log(err)
       return{
        ...state,
        aiResponse:err?.data?.message||"Failed to genrate pdf"
       }
    }
}