"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  MessageSquare,
  Clock,
  MoreVertical,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface Document {
  id: string;
  title: string;
  uploadedAt: string;
  pageCount: number;
  messageCount: number;
  status: "ready" | "processing" | "error";
}

const statusConfig = {
  ready: {
    label: "Ready",
    className: "bg-green-100 text-green-700 border-green-200",
    icon: null,
  },
  processing: {
    label: "Processing…",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: <Loader2 className="w-2.5 h-2.5 animate-spin" />,
  },
  error: {
    label: "Error",
    className: "bg-red-100 text-red-700 border-red-200",
    icon: null,
  },
};

export function DocumentCard({ document }: { document: Document }) {
  const router = useRouter();
  const [status, setStatus] = useState(document.status);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Poll for status while processing — unchanged from before
  useEffect(() => {
    if (status !== "processing") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/documents/${document.id}/status`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status !== "processing") {
          setStatus(data.status);
          clearInterval(interval);
          router.refresh();
        }
      } catch {
        // silently ignore
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [status, document.id, router]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/documents/${document.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setConfirmOpen(false);
      router.refresh(); // re-runs the server component, card disappears
    } catch (err) {
      console.error("[DELETE]", err);
      setIsDeleting(false);
    }
  };

  const { label, className, icon } = statusConfig[status];

  return (
    <>
      <Card className="group relative hover:shadow-md hover:border-primary/30 transition-all duration-200 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary/60 to-accent/60 opacity-0 group-hover:opacity-100 transition-opacity" />

        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-[10px] px-2 py-0 gap-1 ${className}`}
              >
                {icon}
                {label}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive gap-2"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete document
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <h3 className="font-medium text-sm text-foreground leading-tight mb-3 line-clamp-2">
            {document.title}
          </h3>

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {document.pageCount > 0 ? `${document.pageCount} pages` : "—"}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {document.messageCount} chats
            </span>
          </div>
        </CardContent>

        <CardFooter className="px-5 py-3 border-t border-border flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            {document.uploadedAt}
          </span>
          <Link href={`/chat/${document.id}`}>
            <Button
              size="sm"
              variant="outline"
              disabled={status !== "ready"}
              className="h-7 text-xs gap-1.5"
            >
              <MessageSquare className="w-3 h-3" />
              Open Chat
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* ── Confirmation dialog ── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete document?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">
                {document.title}
              </span>{" "}
              will be permanently deleted — including the PDF file and all chat
              history. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isDeleting ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
