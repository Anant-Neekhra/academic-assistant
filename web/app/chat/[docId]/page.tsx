"use client";

import Link from "next/link";
import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatWindow } from "@/components/chat-window";
import {
  BookOpen,
  ChevronLeft,
  FileText,
  ZoomIn,
  ZoomOut,
  ChevronLeft as PrevPage,
  ChevronRight as NextPage,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

// In a real app, fetch doc metadata from your API using docId
const MOCK_DOC = {
  title:
    "Cognitive Psychology: Connecting Mind, Research and Everyday Experience",
  pageCount: 624,
};

export default function ChatPage({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const { docId } = use(params);
  const [pdfPanelOpen, setPdfPanelOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top nav */}
      <header className="flex items-center gap-3 px-4 h-12 border-b border-border shrink-0 bg-background/90 backdrop-blur-md">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <BookOpen className="w-3 h-3 text-primary-foreground" />
          </div>
          <span
            className="text-sm font-semibold hidden sm:block"
            style={{ fontFamily: "var(--font-crimson)" }}
          >
            Lexis
          </span>
        </div>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-xs text-muted-foreground truncate max-w-xs">
          {MOCK_DOC.title}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPdfPanelOpen(!pdfPanelOpen)}
            title={pdfPanelOpen ? "Hide PDF panel" : "Show PDF panel"}
          >
            {pdfPanelOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </Button>
          <UserButton />
        </div>
      </header>

      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT: PDF Viewer ── */}
        {pdfPanelOpen && (
          <div className="w-[48%] lg:w-[52%] flex flex-col border-r border-border bg-muted/20 min-w-0">
            {/* PDF toolbar */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-background/60 shrink-0">
              <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate flex-1">
                Page {currentPage} of {MOCK_DOC.pageCount}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <PrevPage className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(MOCK_DOC.pageCount, p + 1))
                  }
                  disabled={currentPage === MOCK_DOC.pageCount}
                >
                  <NextPage className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ZoomIn className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ZoomOut className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* PDF canvas area — replace with <PDFViewer> component */}
            <div className="flex-1 flex flex-col items-center justify-center overflow-auto p-6">
              <div className="w-full max-w-lg aspect-[8.5/11] bg-white rounded-lg shadow-lg border border-border flex flex-col items-center justify-center gap-4 text-center p-8">
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                  <FileText className="w-7 h-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">
                    PDF Viewer Placeholder
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Integrate{" "}
                    <code className="bg-muted px-1 py-0.5 rounded text-[11px]">
                      react-pdf
                    </code>{" "}
                    or{" "}
                    <code className="bg-muted px-1 py-0.5 rounded text-[11px]">
                      pdfjs-dist
                    </code>{" "}
                    here to render the document for{" "}
                    <span className="font-medium text-foreground">
                      docId: {docId}
                    </span>
                  </p>
                </div>
                <div className="space-y-1.5 w-full mt-2">
                  {[100, 85, 95, 70, 90, 60, 80].map((w, i) => (
                    <div
                      key={i}
                      className="h-2 rounded-full bg-muted"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── RIGHT: Chat ── */}
        <div
          className={`flex flex-col min-w-0 ${pdfPanelOpen ? "flex-1" : "flex-1"}`}
        >
          <ChatWindow docTitle={MOCK_DOC.title} />
        </div>
      </div>
    </div>
  );
}
