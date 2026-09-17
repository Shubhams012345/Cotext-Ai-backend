import { checkAgentLimit } from "../config/agentLimit.js";
import { getModel } from "../config/llmModel.js"
import { deductCredits } from "../utils/deductCredits.js"
import { extractJson } from "../utils/extractJson.js";

export const codingAgent=async(state)=>{  
    await checkAgentLimit(state.userId,"coding")  
    const knowIntent=await getModel("intent");
    const llm=await getModel("coding")
    const intentRes=await knowIntent.invoke(`
        You are an intent classifier.
        
        Return ONLY one of these values.
        CODE_GENERATION
        CODE_REVIEW
        CODE_EXPLANATION
        DEBUGGING
        OPTIMIZATION
        CONVERSION
        DOCUMENTATION
        
        USER Request:
        ${state.prompt}`)

   const intent = intentRes.content.trim();
   
   if(intent==="CODE_GENERATION"){
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

Rules:
Return ONLY valid JSON.

Do NOT return markdown.
Do NOT use \`\`\`.
Do NOT explain anything outside the JSON.
Do NOT include any text before or after the JSON.

The JSON schema is:

{
  "title": "Short title",
  "language": "java",
  "files": [
    {
      "filename": "Solution.java",
      "content": "complete source code here"
    }
  ]
}

Rules:
- Response must be valid JSON.
- Double quotes only.
- Escape newlines correctly.
- Never include markdown.

User Request:
${state.prompt}

`
const res = await llm.invoke(prompt);



const data = extractJson(res.content);
const file=data.files?.[0];
await deductCredits(state.userId,"coding")

return{
    ...state,
      aiResponse:`## ${data.title}

\`\`\`java
${file.content}
\`\`\`
`,
    artifacts:[
        {
            id:String(Date.now()),
            title:data.title || "Generated code",
            type:"Code",
            language:data.language || "text",
            status:"ready",
            createdAt:new Date(),
            files:data.files ||[]
        }
    ]
}

   }
   const res=await llm.invoke(`
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