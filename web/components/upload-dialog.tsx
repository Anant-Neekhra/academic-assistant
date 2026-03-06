"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing/core";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DialogState = "idle" | "saving" | "success" | "error";

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const router = useRouter();
  const [dialogState, setDialogState] = useState<DialogState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = () => {
    // Don't allow closing while saving
    if (dialogState === "saving") return;
    setDialogState("idle");
    setErrorMessage(null);
    onOpenChange(false);
  };

  const handleSuccess = () => {
    // Refresh the dashboard to show the new document
    router.refresh();
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Upload a Document
          </DialogTitle>
          <DialogDescription>
            Upload a PDF — max 32 MB. Your file is stored securely in the cloud.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {/* ── Success state ── */}
          {dialogState === "success" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Upload complete!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your document has been saved and is being processed.
                </p>
              </div>
              <Button onClick={handleSuccess} className="mt-2">
                Back to Dashboard
              </Button>
            </div>
          )}

          {/* ── Saving to DB state ── */}
          {dialogState === "saving" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
              <div>
                <p className="font-medium text-foreground">Saving document…</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Just a moment while we save your file metadata.
                </p>
              </div>
            </div>
          )}

          {/* ── Error state ── */}
          {dialogState === "error" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Upload failed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {errorMessage ?? "Something went wrong. Please try again."}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogState("idle");
                  setErrorMessage(null);
                }}
                className="mt-2"
              >
                Try again
              </Button>
            </div>
          )}

          {/* ── Idle: UploadThing dropzone ── */}
          {dialogState === "idle" && (
            <UploadDropzone<OurFileRouter, "pdfUploader">
              endpoint="pdfUploader"
              appearance={{
                container:
                  "border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-all duration-200 ut-uploading:border-primary/50 ut-uploading:bg-primary/5",
                uploadIcon: "text-muted-foreground w-10 h-10",
                label:
                  "text-sm font-medium text-foreground hover:text-primary transition-colors",
                allowedContent: "text-xs text-muted-foreground mt-1",
                button:
                  "bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors ut-uploading:opacity-60 ut-uploading:cursor-not-allowed",
              }}
              content={{
                label: "Drag & drop your PDF here, or click to browse",
                allowedContent: "PDF only · up to 32 MB",
              }}
              onClientUploadComplete={async (res) => {
                // res is an array — we only allow 1 file
                const file = res[0];
                if (!file) return;

                setDialogState("saving");

                try {
                  // Save metadata to MongoDB via our API route
                  const response = await fetch("/api/documents/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      title: file.name.replace(/\.pdf$/i, ""), // Strip extension for cleaner title
                      fileUrl: file.url,
                    }),
                  });

                  if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error ?? "Failed to save document");
                  }

                  setDialogState("success");
                } catch (err) {
                  console.error("[UPLOAD_COMPLETE]", err);
                  setErrorMessage(
                    err instanceof Error
                      ? err.message
                      : "Failed to save document",
                  );
                  setDialogState("error");
                }
              }}
              onUploadError={(error) => {
                console.error("[UPLOADTHING_ERROR]", error);
                setErrorMessage(error.message);
                setDialogState("error");
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
