import { checkAgentLimit } from "../config/agentLimit.js";
import { getModel } from "../config/llmModel.js"
import { deductCredits } from "../utils/deductCredits.js"


export const codingAgent=async(state)=>{  
    await checkAgentLimit(state.userId,"coding")  
    const knowIntent=await getModel("intent");
    const llm=await getModel("coding")
    const intentRes=await knowIntent.invoke(`
        You are an intent classifier.
        
        Return ONLY one of these values.
        CODE_GENRATION
        CODE_REVIEW
        CODE_EXPLANATION
        DEBUGGING
        OPTIMIZATION
        CONVERSION
        DOCUMENTATION
        
        USER Request:
        ${state.prompt}`)

   const intent=intentRes.content
   if(intent==="CODE_GENRATION"){
      const prompt=`You are a Senior Software Engineer AI.

Your responsibility is to write production-ready code.

Requirements:

- Fully understand the user's request.
- If important information is missing, ask concise clarification questions.
- Produce clean, modular, maintainable code.
- Follow SOLID, DRY, and KISS principles.
- Choose the simplest correct solution.
- Use meaningful variable and function names.
- Include comments only where they improve clarity.
- Validate inputs.
- Handle errors gracefully.
- Consider security and performance.
- Avoid deprecated libraries and APIs.
- Do not invent libraries or functions.

Response Format:

## Approach

Brief explanation.

## Implementation

Provide complete code.

## Complexity

Time and Space Complexity.

## Notes

Mention assumptions and edge cases.

Rules:
-output must start with {
-output must end with }
-No extra text
-No \'\'\
-Never mention intent

User Request:${state.prompt }
`
const res=await llm.invoke(prompt)
const data=JSON.parse(res.content)
await deductCredits(state.userId,"coding")

return{
    ...state,
    aiResponse:"Code genrated successfully",
    artifacts:[
        {
            id:Date.now(),
            type:"Project",
            files:data.files ||[]
        }
    ]
}

   }
   const res=llm.invoke(`
    You are a Senior Code Reviewer.

Review the submitted code.

Focus on:

- Bugs
- Logic errors
- Performance
- Security
- Readability
- Naming
- Best practices
- Maintainability
- Edge cases

Do not rewrite the entire code unless requested.

Response format:

## Summary

## Issues

For each issue include:

- Severity (High/Medium/Low)
- Explanation
- Suggested Fix

## Overall Rating
User request:
${state.prompt}`)

  const data=res.content
await deductCredits(state.userId,"coding")

  return{
    ...state,
    aiResponse:data,
    artifacts:[]
  }
}