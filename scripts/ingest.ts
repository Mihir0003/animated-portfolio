import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { QdrantClient } from "@qdrant/js-client-rest";
import { getEmbedding } from "../lib/embeddings";



// Load environment variables from .env
dotenv.config();

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const COLLECTION_NAME = process.env.QDRANT_COLLECTION || "portfolio";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text";

if (!QDRANT_URL || !QDRANT_API_KEY) {
  console.error("Error: Missing required environment variables in .env (QDRANT_URL, QDRANT_API_KEY)");
  process.exit(1);
}

// Initialize Qdrant Client
const qdrant = new QdrantClient({ url: QDRANT_URL, apiKey: QDRANT_API_KEY, checkCompatibility: false });

// Category mapping helper based on filename
function getCategory(filename: string): string {
  switch (filename) {
    case "profile.md":
      return "profile";
    case "skills.md":
      return "skills";
    case "internship.md":
      return "internship";
    case "afsnoc.md":
      return "project";
    case "projects.md":
      return "project";
    case "certifications.md":
      return "certification";
    case "education.md":
      return "education";
    case "resume.md":
      return "resume";
    case "contact.md":
      return "contact";
    default:
      return "general";
  }
}

// Chunking function with overlap
function chunkText(text: string, size = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    let end = start + size;
    if (end < text.length) {
      // Find the last space or newline to avoid cutting in the middle of a word
      const lastSpace = text.lastIndexOf(" ", end);
      if (lastSpace > start + size - 200) {
        end = lastSpace;
      }
    }
    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
    if (start < 0) start = 0;
    if (end >= text.length) break;
  }
  
  return chunks;
}

// Simple deterministic ID generator from string
function generateId(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Format as a simple UUID-like string
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `00000000-0000-0000-0000-${hex.slice(0, 12).padStart(12, "f")}`;
}

async function run() {
  const knowledgeDir = path.join(process.cwd(), "knowledge");
  
  if (!fs.existsSync(knowledgeDir)) {
    console.error(`Error: Knowledge directory not found at ${knowledgeDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(knowledgeDir).filter((file) => file.endsWith(".md"));
  console.log(`Found ${files.length} knowledge base files to ingest.`);

  // 1. Recreate Collection in Qdrant (deletes if exists, then creates with Cosine metric)
  console.log(`Initializing collection "${COLLECTION_NAME}" in Qdrant...`);
  try {
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);
    if (exists) {
      console.log(`Collection "${COLLECTION_NAME}" exists. Re-creating...`);
      await qdrant.deleteCollection(COLLECTION_NAME);
    }
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 3072, // Dimension for gemini-embedding-2
        distance: "Cosine",
      },
    });
    console.log(`Collection "${COLLECTION_NAME}" created successfully.`);
  } catch (error) {
    console.error("Error setting up Qdrant collection:", error);
    process.exit(1);
  }

  // 2. Load, chunk, and embed documents
  const points = [];
  let chunkCounter = 0;

  for (const file of files) {
    console.log(`Processing file: ${file}...`);
    const filePath = path.join(knowledgeDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const category = getCategory(file);

    // Split document by headings to preserve section boundaries
    const sections = content.split(/\n(?=##\s+)/);

    for (const sectionContent of sections) {
      // Find the heading title of the section
      const lines = sectionContent.trim().split("\n");
      const headingLine = lines[0] || "";
      let sectionName = "General";
      
      if (headingLine.startsWith("##")) {
        sectionName = headingLine.replace(/##\s*/, "").trim();
      } else if (headingLine.startsWith("#")) {
        sectionName = headingLine.replace(/#\s*/, "").trim();
      }

      // Chunk the section text
      const rawChunks = chunkText(sectionContent, 1000, 200);

      for (const textChunk of rawChunks) {
        if (!textChunk) continue;

        // Enhance the chunk text by prepending its section title to maintain context
        const enhancedChunkText = `Document: ${file}\nSection: ${sectionName}\nCategory: ${category}\n\nContent:\n${textChunk}`;

        console.log(`Generating embedding for chunk ${chunkCounter + 1} (${file} -> ${sectionName})...`);
        
        try {
          const embedding = await getEmbedding(enhancedChunkText, false);

          const pointId = generateId(`${file}_chunk_${chunkCounter}_${sectionName}`);

          points.push({
            id: pointId,
            vector: embedding,
            payload: {
              text: textChunk, // Store raw text chunk for context window usage
              source: file,
              section: sectionName,
              category: category,
            },
          });

          chunkCounter++;
        } catch (err) {
          console.error(`Error generating embedding for chunk in ${file}:`, err);
        }
      }
    }
  }

  // 3. Upload to Qdrant
  if (points.length > 0) {
    console.log(`Uploading ${points.length} points to Qdrant collection "${COLLECTION_NAME}"...`);
    try {
      await qdrant.upsert(COLLECTION_NAME, {
        wait: true,
        points: points,
      });
      console.log("Data ingestion completed successfully! All vectors stored.");
    } catch (error) {
      console.error("Error upserting vectors to Qdrant:", error);
    }
  } else {
    console.log("No vectors were generated. Ingestion aborted.");
  }
}

run();
