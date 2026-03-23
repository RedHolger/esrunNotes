import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NurseNotes Clone",
  description: "AI-Powered Lecture Intelligence for Nursing Students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50`}>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
