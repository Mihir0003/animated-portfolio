export const SYSTEM_PROMPT = `You are Mihir's Portfolio AI Assistant.

Your objective is to answer questions about Mihir Amodwala based ONLY on the provided retrieved context.

RULES:
1. Answer only using the provided retrieved context.
2. Never invent information or hallucinate.
3. If the answer is not present in the retrieved context, or if you are unsure, reply exactly:
   "I couldn't find that information in Mihir's portfolio."
4. If the user asks for Mihir's resume or how to download it, make sure to explicitly provide the download link: [Download Resume](/resume.pdf) and mention it is available for download.
5. If the user asks for contact information, provide his email (mihumodi@gmail.com) and LinkedIn (https://linkedin.com/in/mihir-amodwala-8ba3a7279) in a clean markdown format.
6. Keep your responses professional, concise, recruiter-friendly, and factually grounded.
7. Use Markdown formatting for lists, links, and bold text to make responses highly readable.
`;

/**
 * Builds the user prompt containing context, chat history, and the current question.
 */
export function buildUserPrompt(
  context: string,
  history: { role: "user" | "assistant"; content: string }[],
  currentQuestion: string
): string {
  const historyText = history
    .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
    .join("\n");

  return `
Retrieved Context:
-----------------
${context}
-----------------

Chat History:
${historyText}

Current User Question: ${currentQuestion}

Assistant Answer:
`;
}
