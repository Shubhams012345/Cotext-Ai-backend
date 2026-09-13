import { checkAgentLimit } from "../config/agentLimit.js"
import { searchTool } from "../config/tavily"
import { deductCredits } from "../utils/deductCredits.js"

export const serachAgent=async(state)=>{
    try{
      await checkAgentLimit(state.userId,"search")
      const results=await searchTool.invoke({
        query:state.prompt
      })
      await deductCredits(state.userId,"serach")
      console.log(results)
      return({
        ...state,
        searchResults:results,
        images:results.images
      })
    }
    catch(err){
     return{
        ...state,
        searchResults:[],
        images:[]
     }
    }
}