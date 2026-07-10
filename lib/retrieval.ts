import * as fs from "fs";
import * as path from "path";

export interface RetrievedChunk {
  text: string;
  source: string;
  section: string;
  category: string;
  score: number;
}

// Compute cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Searches the local JSON embeddings database for the top 5 most relevant chunks with a similarity >= 0.45.
 * @param queryVector The embedding vector of the user's question.
 * @returns A promise resolving to an array of filtered RetrievedChunks.
 */
export async function retrieveContext(queryVector: number[]): Promise<RetrievedChunk[]> {
  try {
    const embeddingsPath = path.join(process.cwd(), "knowledge", "embeddings.json");
    
    if (!fs.existsSync(embeddingsPath)) {
      console.warn("Embeddings file not found. Please run 'npm run ingest' first.");
      return [];
    }

    const data = fs.readFileSync(embeddingsPath, "utf-8");
    const points = JSON.parse(data);

    const similarityThreshold = 0.45;
    const scoredPoints = points.map((point: any) => {
      const score = cosineSimilarity(queryVector, point.vector);
      return {
        ...point,
        score
      };
    });

    const filteredResults = scoredPoints
      .filter((point: any) => point.score >= similarityThreshold)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 5)
      .map((point: any) => {
        const payload = point.payload || {};
        return {
          text: (payload.text as string) || "",
          source: (payload.source as string) || "unknown",
          section: (payload.section as string) || "unknown",
          category: (payload.category as string) || "unknown",
          score: point.score,
        };
      });

    return filteredResults;
  } catch (error) {
    console.error("Error retrieving context from local embeddings:", error);
    return []; // Return empty if there's database retrieval failure to gracefully handle it
  }
}

