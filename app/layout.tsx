import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import SideMedallions from "./components/SideMedallions";
import GridOverlay from "./components/GridOverlay";
import VisibilityHotkey from "./components/VisibilityHotkey";

export const metadata: Metadata = {
  title: "Our Manifesto — Reserve Bank Innovation Hub",
  description: "The Reserve Bank Innovation Hub manifesto."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* RBIH's official typeface: Anek Latin (headings + body) via Google
            Fonts — the same family the rbihub.in site self-hosts. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anek+Latin:wght@400;500;600;700;800&display=swap"
        />
        {/* Sentient (Fontshare) — used for the gold-foil hero tagline */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=sentient@400,500,700&display=swap"
        />
      </head>
      <body>
        {/* persistent gold-foil medallion panel behind the whole site */}
        <SideMedallions />
        <Nav />
        {children}
        <Footer />
        <GridOverlay />
        <VisibilityHotkey />
      </body>
    </html>
  );
}
