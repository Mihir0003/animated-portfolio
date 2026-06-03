import type { Metadata } from "next";
import { Orbitron, Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-orbitron",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mihir Amodwala | Full-Stack Developer Portfolio",
  description:
    "Portfolio of Mihir Miteshkumar Amodwala, an IT Engineer and Full-Stack Developer specializing in Spring Boot, Python FastAPI, WebSockets, and Cloud architectures.",
  keywords: [
    "Mihir Amodwala",
    "Portfolio",
    "Spring Boot",
    "Java Developer",
    "FastAPI",
    "WebSockets",
    "Agile Kanban",
    "Dynamic Form Engine",
    "Jio-bp",
    "Software Engineer",
  ],
  authors: [{ name: "Mihir Amodwala" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${outfit.variable} ${spaceGrotesk.variable} scroll-smooth`}
    >
      <body className="font-space antialiased min-h-screen bg-bg-deep select-none">
        <div className="blob background-blob-1"></div>
        <div className="blob background-blob-2"></div>
        {children}
      </body>
    </html>
  );
}
