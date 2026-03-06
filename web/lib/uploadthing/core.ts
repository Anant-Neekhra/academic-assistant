import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({
    pdf: {
      maxFileSize: "32MB",
      maxFileCount: 1,
    },
  })
    // Runs on your server before the upload begins.
    // Returning a value here makes it available in onUploadComplete.
    .middleware(async () => {
      const { userId } = await auth();

      if (!userId) throw new Error("Unauthorized");

      // Whatever we return here is accessible in onUploadComplete as `metadata`
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This runs on your server after UploadThing finishes storing the file.
      // We just log here — the actual MongoDB save is triggered from the client
      // via /api/documents/save so we keep DB logic centralized.
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);

      // Whatever we return here is forwarded to onClientUploadComplete()
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
