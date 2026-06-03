import { NextRequest, NextResponse } from "next/server";
import { getRAGResponse } from "@/lib/rag";

// Force dynamic execution for server-side operations
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "A valid 'message' string is required in the request body." },
        { status: 400 }
      );
    }

    // Call the RAG pipeline
    const answer = await getRAGResponse(message, history || []);

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("Error in POST /api/chat:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred on the server." },
      { status: 500 }
    );
  }
}
