import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibe Coder Score — How good is your AI coding setup?",
  description:
    "Deep scan your AI coding environment. Get your tier, archetype, and shareable card.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0f0f1a] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
