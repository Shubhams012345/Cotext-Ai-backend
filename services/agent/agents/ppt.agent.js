import {getModel} from '../config/llmModel.js'
import { genratePpt } from '../utils/genratePpt.js';
import { getFromS3 } from '../utils/getFromS3.js';
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from '../config/agentLimit.js';
import {uploadToS3} from '../utils/uploadTos3.js'
export const pptAgent=async(state)=>{
    try{
        await checkAgentLimit(state.userId,"ppt")
      const llm=await getModel("ppt")
    const prompt=`You are a professional presentation designer
    
    Return only valid JSON
    
    Format:
    {
    "title":"",
    "subtitle":"",
    "slides":[
    {
    "title":"",
    "points":[
    "",
    "",
    "",
    ""
    ]
    }
    ]
    }
    Rules:
    -Genrate exactly 6 content slides.
    -Each slide should have 4-6 concise bullet points.
    -No markdown
    -No explanations.
    -No code block
    -return only JSON.
    
    Topic:${state.prompt}`

    const res=await llm.invoke(prompt);
    const data=JSON.parse(res.content)
    await deductCredits(state.userId,"ppt")

    const ppt=await genratePpt(data)
    const buffer=await ppt.write({
        outputType:"nodebuffer"
    })

    const filename=`ppt-${Date.now()}.pptx`
    await uploadToS3(filename,buffer,"application/vnd.openxmlformats-officedocument.presentationml.presentation")
    const downloadUrl=await getFromS3(filename,24*60*60)

    return{
        ...state,
        aiResponse:`🎬 Presentation Genrated
        **${data.title}**
        [Download ppt](${downloadUrl})
        ⌛_Link expires in 10 minutes._`
        ,artifacts:[{
          id:filename,
          title:data.title || "Generated presentation",
          type:"PPT",
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
        aiResponse:err?.data?.message||"Failed to genrate ppt"
       }
    }
    

}