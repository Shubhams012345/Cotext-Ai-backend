export function extractJson(text) {
  if (!text) {
    throw new Error("Empty response from LLM");
  }

  // Remove markdown
  text = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // Find first JSON object
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No JSON object found.\n\n" + text);
  }

  const jsonString = text.slice(start, end + 1);

  return JSON.parse(jsonString);
}