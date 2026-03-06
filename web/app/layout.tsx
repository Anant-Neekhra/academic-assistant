import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Crimson_Pro } from "next/font/google";
import "./globals.css";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/lib/uploadthing/core";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const crimson = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson",
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Lexis — Academic Assistant",
  description: "Chat with your textbooks using AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className={`${geist.variable} ${crimson.variable}`}>
        <body className="antialiased">
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
