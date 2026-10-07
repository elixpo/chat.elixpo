import type { Metadata } from "next";
// @ts-expect-error CSS files are handled by Next.js at build time.
import "./global.css";

export const metadata: Metadata = {
  title: "Elixpo Chat",
  description: "Elixpo Chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
