import dns from "dns";

// Force IPv4 lookup for local network connections (Ollama)
dns.setDefaultResultOrder("ipv4first");

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text";

/**
 * Generates vector embeddings for a given input text using Ollama's local nomic-embed-text model.
 * @param text The input string to embed.
 * @param isQuery Whether this is a search query (requires "search_query: " prefix) or a document chunk (requires "search_document: " prefix).
 * @returns A promise resolving to an array of numbers representing the embedding vector (768 dimensions).
 */
export async function getEmbedding(text: string, isQuery = true): Promise<number[]> {
  try {
    // 1. If GEMINI_API_KEY is defined, use Google's cloud embedding service (Required for Vercel/Production)
    if (process.env.GEMINI_API_KEY) {
      console.log("Generating embedding via Gemini Cloud API...");
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${process.env.GEMINI_API_KEY}`;
      
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: {
            parts: [{ text: text.replace(/\n/g, " ") }],
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini Embedding API responded with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const embedding = data.embedding?.values;

      if (!embedding || embedding.length === 0) {
        throw new Error("No embedding returned from Gemini API.");
      }

      return embedding;
    }

    // 2. Fallback to local Ollama embedding if no API key is defined
    console.log("Generating embedding via local Ollama...");
    const prefix = isQuery ? "search_query: " : "search_document: ";
    const promptText = `${prefix}${text.replace(/\n/g, " ")}`;

    const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        prompt: promptText,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama embedding API responded with status ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as { embedding: number[] };

    if (!data.embedding || data.embedding.length === 0) {
      throw new Error("No embedding returned from Ollama API.");
    }

    return data.embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}
