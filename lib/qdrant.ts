import { QdrantClient } from "@qdrant/js-client-rest";
import dns from "dns";

// Monkey-patch dns.lookup to force IPv4 and bypass macOS/Node IPv6 fetch bugs
const originalLookup = dns.lookup;
// @ts-ignore
dns.lookup = function (hostname, options, callback) {
  let cb = callback;
  let opt = options;
  if (typeof opt === "function") {
    cb = opt;
    opt = {};
  }
  const finalOpt = typeof opt === "number" ? { family: 4 } : { ...opt, family: 4 };
  return originalLookup.call(dns, hostname, finalOpt, cb);
};
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
