import { qdrant, COLLECTION_NAME } from "./qdrant";

export interface RetrievedChunk {
  text: string;
  source: string;
  section: string;
  category: string;
  score: number;
}

/**
 * Searches the Qdrant database for the top 5 most relevant chunks with a similarity >= 0.75.
 * @param queryVector The embedding vector of the user's question.
 * @returns A promise resolving to an array of filtered RetrievedChunks.
 */
export async function retrieveContext(queryVector: number[]): Promise<RetrievedChunk[]> {
  try {
    const searchResults = await qdrant.search(COLLECTION_NAME, {
      vector: queryVector,
      limit: 5,
      with_payload: true,
    });

    const similarityThreshold = 0.45;

    const filteredResults = searchResults
      .filter((point) => point.score >= similarityThreshold)
      .map((point) => {
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
    console.error("Error retrieving context from Qdrant:", error);
    return []; // Return empty if there's database retrieval failure to gracefully handle it
  }
}
