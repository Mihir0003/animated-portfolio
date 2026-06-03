import { QdrantClient } from "@qdrant/js-client-rest";
const url = process.env.QDRANT_URL;
const apiKey = process.env.QDRANT_API_KEY;

if (!url || !apiKey) {
  console.warn("Warning: QDRANT_URL or QDRANT_API_KEY is not defined in environment variables.");
}

export const qdrant = new QdrantClient({
  url: url || "http://localhost:6333",
  apiKey: apiKey || undefined,
  checkCompatibility: false,
});

export const COLLECTION_NAME = process.env.QDRANT_COLLECTION || "portfolio";
