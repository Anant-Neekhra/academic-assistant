"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentCard, type Document } from "@/components/document-card";
import { UploadDialog } from "@/components/upload-dialog";
import { BookOpen, Plus, Search, LayoutGrid } from "lucide-react";

interface DashboardClientProps {
  documents: Document[];
}

export function DashboardClient({ documents }: DashboardClientProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = documents.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span
              className="text-lg font-semibold"
              style={{ fontFamily: "var(--font-crimson)" }}
            >
              Lexis
            </span>
            <span className="text-muted-foreground/40 mx-1 text-lg">/</span>
            <span className="text-sm text-muted-foreground font-medium">
              Dashboard
            </span>
          </div>
          <UserButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1
              className="text-3xl font-light text-foreground"
              style={{ fontFamily: "var(--font-crimson)" }}
            >
              Your Library
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {documents.length} document{documents.length !== 1 ? "s" : ""} ·{" "}
              {documents.filter((d) => d.status === "ready").length} ready to
              chat
            </p>
          </div>
          <Button onClick={() => setUploadOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Upload Document
          </Button>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search documents…"
              className="pl-9 h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>

        {/* Document grid */}
        {documents.length === 0 ? (
          // ── Empty state: no documents at all ──
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              Your library is empty
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              Upload your first PDF to start chatting with it.
            </p>
            <Button onClick={() => setUploadOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Upload your first document
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          // ── Empty state: search returned nothing ──
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h3 className="font-semibold text-foreground mb-1">
              No results for &ldquo;{search}&rdquo;
            </h3>
            <p className="text-sm text-muted-foreground">
              Try a different search term.
            </p>
          </div>
        ) : (
          // ── Document grid ──
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}

            {/* Upload CTA card */}
            <button
              onClick={() => setUploadOpen(true)}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/30 transition-all duration-200 p-8 text-center min-h-[180px] group"
            >
              <div className="w-10 h-10 rounded-lg bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Add document
              </span>
            </button>
          </div>
        )}
      </main>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
