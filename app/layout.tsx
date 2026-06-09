import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Relave AI — Tailings early warning",
  description:
    "Satellite-and-AI tailings-failure early warning for the mid-tier mines and regulators that radar can't reach. Built in Australia, ready for Peru.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 md:px-8">{children}</main>
      </body>
    </html>
  );
}
