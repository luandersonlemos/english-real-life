import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PwaRegister } from "@/components/PwaRegister";
import { GalaxyBackground } from "@/components/GalaxyBackground";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "English by Real Life — Aprenda inglês do seu dia a dia",
  description:
    "Treinador pessoal de inglês por blocos temáticos. Palavras visuais, frases simples, repetição espaçada e situações reais.",
  applicationName: "English by Real Life",
  appleWebApp: {
    capable: true,
    title: "EBRL",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <GalaxyBackground />
        <AuthProvider>
          <div className="relative z-0 flex min-h-full flex-col">{children}</div>
          <PwaRegister />
        </AuthProvider>
      </body>
    </html>
  );
}
