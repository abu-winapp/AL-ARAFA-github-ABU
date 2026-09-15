import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Al Arafa Cuisine",
  description:
    "Contact Al Arafa Cuisine in Singapore for reservations, enquiries, dining and catering.",
};

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}