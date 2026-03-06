"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Clock, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Document {
  id: string;
  title: string;
  uploadedAt: string;
  pageCount: number;
  messageCount: number;
  status: "ready" | "processing" | "error";
}

interface DocumentCardProps {
  document: Document;
}

export function DocumentCard({ document }: DocumentCardProps) {
  const statusConfig = {
    ready: {
      label: "Ready",
      className: "bg-green-100 text-green-700 border-green-200",
    },
    processing: {
      label: "Processing…",
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    error: {
      label: "Error",
      className: "bg-red-100 text-red-700 border-red-200",
    },
  };

  const { label, className } = statusConfig[document.status];

  return (
    <Card className="group relative hover:shadow-md hover:border-primary/30 transition-all duration-200 overflow-hidden">
      {/* Colored top stripe */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 to-accent/60 opacity-0 group-hover:opacity-100 transition-opacity" />

      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-[10px] px-2 py-0 ${className}`}
            >
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
                <DropdownMenuItem className="text-destructive">
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
            {document.pageCount} pages
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
            disabled={document.status !== "ready"}
            className="h-7 text-xs gap-1.5"
          >
            <MessageSquare className="w-3 h-3" />
            Open Chat
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
