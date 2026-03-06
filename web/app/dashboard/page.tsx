import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import { DocumentModel, type IDocument } from "@/models/Document";
import { DashboardClient } from "@/components/dashboard-client";

async function getUserDocuments(userId: string) {
  await connectToDatabase();

  const docs = await DocumentModel.find({ clerkUserId: userId })
    .sort({ createdAt: -1 }) // newest first
    .lean(); // returns plain JS objects instead of Mongoose documents

  // Serialize for the client (converts ObjectId and Date to strings)
  return docs.map((doc) => ({
    id: (doc._id as string).toString(),
    title: doc.title,
    fileUrl: doc.fileUrl,
    pageCount: doc.pageCount ?? 0,
    status: doc.status as "processing" | "ready" | "error",
    uploadedAt: doc.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    messageCount: 0, // wire up later when chat history is built
  }));
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const documents = await getUserDocuments(userId);

  return <DashboardClient documents={documents} />;
}
