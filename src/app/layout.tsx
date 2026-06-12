import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skill Studio v2",
  description: "Motor de orquestación puerto-a-puerto",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
