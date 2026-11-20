import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AuraClean AI - Urban Air Quality Assistant",
  description: "GenAI-powered assistant helping families navigate severe winter smog and urban air pollution with low-emission routines and indoor hacks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col font-sans bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
