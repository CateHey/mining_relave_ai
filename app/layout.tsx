import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Relave AI — Mine ESG intelligence",
  description:
    "Satellite-and-AI environmental & ESG monitoring for mines — vegetation, water, dust, land and ground, scored and explained for investors and regulators.",
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
