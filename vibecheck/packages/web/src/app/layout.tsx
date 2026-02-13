import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibe Coder Score — Where does your AI workflow land?",
  description:
    "Map your AI coding setup against a taxonomy of development workflows. One command. Nothing leaves your machine.",
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
