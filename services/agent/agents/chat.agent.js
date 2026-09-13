import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModel.js"
import { getMemory } from "../config/memory.js"
import state from "../graph/state.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

export const chatAgent=async(state)=>{
    await checkAgentLimit(state.userId,"chat")
    await deductCredits(state.userId,"chat")
    const llm=getModel("chat")
    const systemPrompt=`You are context-Ai, an intelligent AI assistant.
    ${searchContext}
    if search exists:
    -use serach result to answer
    -Do not mention internal tools
    `
    const history=await getMemory(state.conversationId)

    const searchContext=state.searchResults?`web Serach Results:${JSON.stringify(state.searchResults)}
    Answer the user using only above the above search results.`:""

    const messages=[
        new SystemMessage(systemPrompt)
    ]

    history.forEach(msg=>{
        if(msg.role=="user"){
            messages.push(new HumanMessage(msg.content))
        }
        else{
            messages.push(new aiResponse(msg.content))
        }
    })
    messages.push(new HumanMessage(state.prompt))
    console.log(messages)
    const response=await llm.invoke(messages)
    return{
        ...state,
        aiResponse:response.content
    }
}