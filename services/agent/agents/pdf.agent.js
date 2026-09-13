import { getModel } from "../config/llmModel"
import { genratePdf } from "../utils/genratePdf"
import { getFromS3 } from "../utils/getFromS3"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

export const pdfAgent=async()=>{
    try{
        await checkAgentLimit(state.userId,"pdf")
     const llm=await getModel("pdf")
     const prompt=await llm.invoke(`
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
        Genrate 4-8 sections.
        Each section should have 3-6 concise bullet points.
        Topic:
        ${state.prompt}
        `)

        const res=await llm.invoke(prompt)
        const data=JSON.parse(res.content);
        await deductCredits(state.userId,"pdf")

        const pdfBuffer=await genratePdf(data)

        const filename=`pdf-${Date.now()}.pdf`
        await uploadToS3(filename,pdfBuffer,"application/pdf")
        const downloadUrl=await getFromS3(filename,24*60 )

        return {
            ...state,
            aiResponse:`# PDF Genrated
            
            **${data.title}**
            
            📩 [Download pdf](${downloadUrl})
            
            ⌛_Link expires in 10 minutes._   `
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