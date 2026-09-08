import type { Metadata } from "next";
import "./globals.css";
import { HeaderWrapper } from "@/components/layout/HeaderWrapper";
import { FooterWrapper } from "@/components/layout/FooterWrapper";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title:
    "Al Arafa Restaurant - Best Biryani in Singapore | Authentic South Indian Cuisine",
  description:
    "Award-winning biryani restaurant in Singapore. Authentic Salem-style chicken & mutton biryani, dosa, curry. Islandwide delivery, dine-in & catering.",
  keywords:
    "biryani Singapore, best biryani, Salem biryani, South Indian food Singapore, halal biryani, Indian restaurant Singapore, biryani delivery, mutton biryani, chicken biryani, dosa Singapore, catering Singapore",
  openGraph: {
    title: "Al Arafa Restaurant - Best Biryani in Singapore",
    description:
      "Award-winning authentic Salem-style biryani. Order online for islandwide delivery or dine-in at our restaurant.",
    type: "website",
    locale: "en_SG",
    siteName: "Al Arafa Restaurant",
  },
  twitter: {
    card: "summary_large_image",
    title: "Al Arafa Restaurant - Best Biryani in Singapore",
    description:
      "Award-winning authentic Salem-style biryani. Order online for islandwide delivery.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="antialiased">
        <AppProviders>
          <HeaderWrapper />
          <main className="min-h-screen">{children}</main>
          <FooterWrapper />
          <Toaster />
          <Sonner />
        </AppProviders>
      </body>
    </html>
  );
}
