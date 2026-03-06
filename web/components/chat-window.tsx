"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, BookMarked } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { page: number; snippet: string }[];
  timestamp: Date;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    content: "What is the main argument in chapter 3?",
    timestamp: new Date(Date.now() - 4 * 60 * 1000),
  },
  {
    id: "2",
    role: "assistant",
    content:
      "Chapter 3 centers on the claim that **working memory capacity** is the primary bottleneck in learning. The author argues that cognitive load — the total amount of mental effort being used — directly limits what can be encoded into long-term memory.\n\nThe chapter introduces three types of cognitive load:\n1. **Intrinsic load** — inherent complexity of the material\n2. **Extraneous load** — poor instructional design\n3. **Germane load** — effort devoted to schema formation",
    sources: [{ page: 87, snippet: "Working memory is severely limited..." }],
    timestamp: new Date(Date.now() - 3 * 60 * 1000),
  },
];

interface ChatWindowProps {
  docTitle: string;
}

export function ChatWindow({ docTitle }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // TODO: Replace with real API call to POST /api/chat
    await new Promise((res) => setTimeout(res, 1500));
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content:
        "This is a placeholder response. Connect this to your RAG pipeline — send the conversation history and docId to your `/api/chat` endpoint and stream the response back here.",
      sources: [{ page: 42, snippet: "Relevant excerpt from the document..." }],
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            {docTitle}
          </p>
          <p className="text-[10px] text-muted-foreground">
            AI Assistant · RAG mode
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-5 max-w-full">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                <AvatarFallback
                  className={`text-[10px] ${
                    message.role === "assistant"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <Bot className="w-3.5 h-3.5" />
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className={`flex-1 space-y-1.5 ${message.role === "user" ? "items-end flex flex-col" : ""}`}
              >
                <div
                  className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[85%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {/* Render newlines and bold for assistant */}
                  {message.role === "assistant" ? (
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: message.content
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\n/g, "<br/>"),
                      }}
                    />
                  ) : (
                    message.content
                  )}
                </div>
                {/* Source citations */}
                {message.sources && message.sources.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {message.sources.map((src, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-[10px] gap-1 h-5 px-1.5 cursor-pointer hover:bg-muted transition-colors"
                      >
                        <BookMarked className="w-2.5 h-2.5" />
                        p. {src.page}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="w-7 h-7 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                  <Bot className="w-3.5 h-3.5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
                <span className="text-xs text-muted-foreground">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t border-border p-3 shrink-0">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this document… (Enter to send)"
            className="min-h-[40px] max-h-32 text-sm resize-none flex-1 py-2.5"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-10 w-10 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          Shift+Enter for new line · Responses cite source page numbers
        </p>
      </div>
    </div>
  );
}
