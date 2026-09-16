import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { HeaderWrapper } from "@/components/layout/HeaderWrapper";
import { MainWrapper } from "@/components/layout/MainWrapper";
import { FooterWrapper } from "@/components/layout/FooterWrapper";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AppProviders } from "@/components/providers/AppProviders";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "Al Arafa Cuisine - Best Biryani in Singapore | Authentic South Indian Cuisine",
  description:
    "Award-winning biryani restaurant in Singapore. Authentic chicken & mutton biryani, dosa, curry. Islandwide delivery, dine-in & catering.",
  keywords:
    "biryani Singapore, best biryani, South Indian food Singapore, halal biryani, Indian restaurant Singapore, biryani delivery, mutton biryani, chicken biryani, dosa Singapore, catering Singapore",
  openGraph: {
    title: "Al Arafa Cuisine - Best Biryani in Singapore",
    description:
      "Award-winning authentic biryani. Order online for islandwide delivery or dine-in at our restaurant.",
    type: "website",
    locale: "en_SG",
    siteName: "Al Arafa Cuisine",
  },
  twitter: {
    card: "summary_large_image",
    title: "Al Arafa Cuisine - Best Biryani in Singapore",
    description:
      "Award-winning authentic biryani. Order online for islandwide delivery.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/images/logo.webp",
    apple: "/images/logo.webp",
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
      <body
        className={`${plusJakartaSans.variable} antialiased`}
      >
        <AppProviders>
          <HeaderWrapper />
          <MainWrapper>{children}</MainWrapper>
          <FooterWrapper />
          <Toaster />
          <Sonner />
        </AppProviders>
      </body>
    </html>
  );
}
