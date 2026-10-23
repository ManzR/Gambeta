import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav, SiteHeader } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: { default: "Gambeta · Fútbol en vivo, resultados y tablas", template: "%s · Gambeta" },
  description:
    "Resultados de fútbol en vivo, agenda del día, tablas y todo el Ascenso argentino: Primera Nacional, B Metro, Federal A y más.",
};

export const viewport: Viewport = {
  themeColor: "#0d1210",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,700;1,700&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <SiteHeader />
        {children}
        <footer className="foot">
          <div className="container">
            Gambeta · Resultados y estadísticas provistos por API-Football. Los horarios están en hora argentina.
          </div>
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}
