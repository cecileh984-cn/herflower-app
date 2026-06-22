import type { Metadata } from "next";
import { LocalAppStateProvider } from "./components/LocalAppState";
import "./globals.css";

export const metadata: Metadata = {
  title: "HerFlower",
  description: "A women-only global friendship community for verified 18+ women.",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LocalAppStateProvider>{children}</LocalAppStateProvider>
      </body>
    </html>
  );
}
