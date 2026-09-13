import fs, { stat } from "fs"
import { PDFParse } from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { vectoStore } from "../config/vectorDb.js";
import { getModel } from "../config/llmModel.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { deductCredits } from "../utils/deductCredits";
import { checkAgentLimit } from "../config/agentLimit.js";

export const pdfRag=async(state)=>{
    try{
        await checkAgentLimit(state.userId,"pdf")
        const buffer=fs.readFileSync(state.file.path)
        const pdf=new PDFParse({
            data:buffer
        })
        const result=await pdf.getText()
        const text=result.text
        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 })
        const docs=await splitter.createDocuments([text])
        const collectionName=`pdf-${Date.now()}`;
        const store=await vectoStore(docs,collectionName)

        const relevantDocs=await store.similaritySearch(state.prompt,5)
        const context=relevantDocs.map(d=>d.pageContent).join("\n\n")

        const llm=await getModel("pdf-rag")

        const messages=[
            new SystemMessage(
                `You are Cotext-Ai pdf assistant
                
        Rules:
        -Answer only from uploaded pdf.
        -Never make up information.
        -if the answer is not present in the pdf,reply:
        "I could not find the answer in uploaded pdf".
        -use markd formatting.`
            ),
        new HumanMessage(`
            Context:${context}
            Question:${state.prompt}
            `)
        ]
        const response=await llm.invoke(messages)
        await deductCredits(state.userId,"pdf")
        return{
            ...state,
            aiResponse:await response.content
        }
     }
   catch(err){
      console.log(err)
      return{
            ...state,
            aiResponse:"failed to analyze pdf"
        }
   }
   finally{
    fs.unlinkSync(state.file.path)
   }
}