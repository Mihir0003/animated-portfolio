import { getEmbedding } from "./embeddings";
import { retrieveContext } from "./retrieval";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";
import dns from "dns";

// Force IPv4 lookup for local network connections (Ollama)
dns.setDefaultResultOrder("ipv4first");

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const LLM_MODEL = process.env.OLLAMA_LLM_MODEL || "qwen2.5:7b";

/**
 * Executes the full RAG pipeline for a user message.
 * @param message The user's current question.
 * @param history The previous chat history.
 * @returns The generated response from the AI assistant.
 */
export async function getRAGResponse(message: string, history: ChatMessage[]): Promise<string> {
  try {
    // 1. Generate embedding for the user message (768 dimensions via local nomic-embed-text)
    const queryVector = await getEmbedding(message);

    // 2. Retrieve top 5 context chunks from Qdrant
    const contextChunks = await retrieveContext(queryVector);

    // Check if the query is a simple greeting or general assistant introduction
    const cleanMessage = message.trim().toLowerCase();
    const isGreeting = ["hi", "hello", "hey", "greetings", "yo", "who are you", "what are you"].some(
      (greet) => cleanMessage.startsWith(greet) || cleanMessage === greet
    );

    // 3. Prevent hallucinations: If no relevant context is retrieved
    if (contextChunks.length === 0) {
      if (isGreeting) {
        return "Hello 👋! I'm Mihir's AI Assistant. I can answer questions about his skills, professional experience, projects, AFSNOC internship, and resume. Try asking 'Tell me about Mihir' or 'What is Dynamic Form Engine?'.";
      }
      return "I couldn't find that information in Mihir's portfolio.";
    }

    // 4. Compile the retrieved context into a single string
    const contextText = contextChunks
      .map((chunk, index) => `[Context ${index + 1} - Source: ${chunk.source}, Section: ${chunk.section}]\n${chunk.text}`)
      .join("\n\n");

    // 5. Store session memory: Keep only the last 10 messages
    const recentHistory = history.slice(-10);

    // 6. Build the prompt
    const userPrompt = buildUserPrompt(contextText, recentHistory, message);

    let responseText = "";

    // 7. Generate response using either Gemini Cloud API (if key is set) or local Ollama instance
    if (process.env.GEMINI_API_KEY) {
      console.log("Routing query to Gemini 2.5 Flash Cloud API...");
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      
      const geminiContents = [
        ...recentHistory.map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
        { role: "user", parts: [{ text: userPrompt }] }
      ];

      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: geminiContents,
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          generationConfig: {
            temperature: 0.1,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API responded with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    } else {
      console.log("Routing query to local Ollama LLM model...");
      const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: LLM_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...recentHistory.map((msg) => ({
              role: msg.role === "assistant" ? "assistant" : "user",
              content: msg.content,
            })),
            { role: "user", content: userPrompt },
          ],
          stream: false,
          options: {
            temperature: 0.1, // Low temperature to maximize factual alignment
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama Chat API responded with status ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as { message: { content: string } };
      responseText = data.message?.content?.trim() || "";
    }

    // Secondary fallback check to ensure prompt-level hallucination rules are respected
    if (!responseText || responseText.includes("I couldn't find that information")) {
      return "I couldn't find that information in Mihir's portfolio.";
    }

    return responseText;
  } catch (error) {
    console.error("Error executing RAG pipeline:", error);
    return "I'm sorry, I encountered an error retrieving that information. Please try again later.";
  }
}
