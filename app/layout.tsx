import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Nav from "./components/Nav";
import FoilMedallions from "./components/FoilMedallions";

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
      <body>
        <FoilMedallions />
        <Nav />
        {children}
      </body>
    </html>
  );
}
