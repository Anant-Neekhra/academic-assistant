import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import { DocumentModel } from "@/models/Document";

interface SaveDocumentBody {
  title: string;
  fileUrl: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify the user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse and validate the request body
    const body: SaveDocumentBody = await req.json();
    const { title, fileUrl } = body;

    if (!title || !fileUrl) {
      return NextResponse.json(
        { error: "Missing required fields: title and fileUrl" },
        { status: 400 },
      );
    }

    if (!fileUrl.startsWith("https://")) {
      return NextResponse.json({ error: "Invalid file URL" }, { status: 400 });
    }

    // 3. Connect to MongoDB and save the document
    await connectToDatabase();

    const newDocument = await DocumentModel.create({
      title: title.trim(),
      fileUrl,
      clerkUserId: userId,
      status: "processing", // Will be updated after PDF processing (LangChain step)
    });

    // 4. Return the created document
    return NextResponse.json(
      {
        success: true,
        document: {
          id: newDocument._id.toString(),
          title: newDocument.title,
          fileUrl: newDocument.fileUrl,
          status: newDocument.status,
          createdAt: newDocument.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[DOCUMENTS_SAVE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
