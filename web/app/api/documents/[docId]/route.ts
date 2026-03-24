import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import { DocumentModel } from "@/models/Document";
import { UTApi } from "uploadthing/server";

const utApi = new UTApi();

// Extracts the UploadThing file key from a CDN URL
// e.g. "https://utfs.io/f/abc123def456" → "abc123def456"
function extractFileKey(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl);
    const parts = url.pathname.split("/");
    return parts[parts.length - 1] ?? null;
  } catch {
    return null;
  }
}

async function deleteFromFaiss(docId: string) {
  const ragApiUrl = process.env.RAG_API_URL;
  const secret = process.env.INTERNAL_API_SECRET;

  if (!ragApiUrl || !secret) return;

  try {
    await fetch(`${ragApiUrl}/document/${docId}`, {
      method: "DELETE",
      headers: { "x-internal-token": secret },
    });
  } catch (err) {
    // Log but don't fail the whole delete if FastAPI is unreachable
    console.error("[DELETE] Failed to delete FAISS index:", err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ docId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { docId } = await params;

    await connectToDatabase();

    // 1. Find the document and verify ownership
    const doc = await DocumentModel.findOne({
      _id: docId,
      clerkUserId: userId,
    });

    if (!doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    // Run all three deletions — MongoDB, UploadThing, FAISS
    // We use Promise.allSettled so one failure doesn't block the others
    const [mongoResult, utResult, faissResult] = await Promise.allSettled([
      // 2. Delete from MongoDB
      DocumentModel.findByIdAndDelete(docId),

      // 3. Delete from UploadThing CDN
      (async () => {
        const fileKey = extractFileKey(doc.fileUrl);
        if (!fileKey) throw new Error("Could not extract file key from URL");
        await utApi.deleteFiles(fileKey);
      })(),

      // 4. Delete FAISS index from FastAPI server
      deleteFromFaiss(docId),
    ]);

    // Log any partial failures — the document record is gone either way
    if (mongoResult.status === "rejected") {
      console.error("[DELETE] MongoDB:", mongoResult.reason);
    }
    if (utResult.status === "rejected") {
      console.error("[DELETE] UploadThing:", utResult.reason);
    }
    if (faissResult.status === "rejected") {
      console.error("[DELETE] FAISS:", faissResult.reason);
    }

    return NextResponse.json({ success: true, docId });
  } catch (error) {
    console.error("[DOCUMENTS_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
