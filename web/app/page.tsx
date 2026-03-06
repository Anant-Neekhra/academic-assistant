import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Brain,
  FileText,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/3 blur-2xl" />
      </div>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <span
            className="text-xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-crimson)" }}
          >
            Lexis
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm">Get started free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-16 text-center">
        <Badge
          variant="secondary"
          className="mb-6 gap-1.5 px-3 py-1 text-xs font-medium"
        >
          <Sparkles className="w-3 h-3 text-accent" />
          Powered by Retrieval-Augmented Generation
        </Badge>

        <h1
          className="text-6xl md:text-7xl lg:text-8xl font-light leading-[0.95] tracking-tight mb-8 text-foreground"
          style={{ fontFamily: "var(--font-crimson)" }}
        >
          Your textbooks, <em className="not-italic text-primary">finally</em>
          <br />
          talk back.
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload dense academic PDFs and have natural conversations with their
          content. Lexis understands context, cites sources, and helps you
          master complex material faster.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/sign-up">
            <Button size="lg" className="gap-2 h-12 px-6 text-base">
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" size="lg" className="h-12 px-6 text-base">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-5xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: FileText,
              title: "PDF Comprehension",
              description:
                "Upload any academic PDF — textbooks, papers, lecture notes. Lexis processes and indexes every page.",
            },
            {
              icon: Brain,
              title: "Contextual Answers",
              description:
                "Ask questions in plain English. Get precise answers with citations pointing to the exact page and paragraph.",
            },
            {
              icon: MessageSquare,
              title: "Conversational Memory",
              description:
                "Follow-up questions understood in context. Explore complex topics through natural back-and-forth dialogue.",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group relative rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6 hover:border-primary/30 hover:bg-card transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Mock UI preview */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-2xl shadow-primary/5">
          {/* Mock browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
            <div className="w-3 h-3 rounded-full bg-red-400/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
            <div className="w-3 h-3 rounded-full bg-green-400/60" />
            <div className="flex-1 mx-4">
              <div className="h-5 rounded-md bg-background/80 border border-border max-w-xs mx-auto flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground">
                  lexis.app/chat/doc_123
                </span>
              </div>
            </div>
          </div>
          {/* Mock split screen */}
          <div className="flex h-72">
            <div className="flex-1 bg-muted/30 border-r border-border flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary/60" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                PDF Viewer
              </span>
              <div className="space-y-1.5 w-32">
                {[100, 80, 95, 60, 85].map((w, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full bg-muted-foreground/20"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-4 space-y-3">
                {[
                  {
                    role: "user",
                    text: "What is the central argument in chapter 3?",
                  },
                  {
                    role: "ai",
                    text: "Chapter 3 argues that cognitive load theory directly impacts working memory capacity...",
                  },
                ].map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border">
                <div className="h-8 rounded-lg bg-muted border border-border flex items-center px-3">
                  <span className="text-xs text-muted-foreground">
                    Ask a question...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>Built with Next.js · Shadcn UI · Clerk · RAG Pipeline</p>
      </footer>
    </main>
  );
}
