import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cold Chain Risk Scorer | Premium Fields",
  description:
    "Answer 10 quick questions to get your Cold Chain Risk Score — and find out where your fresh fruit operation is most exposed.",
  openGraph: {
    title: "Cold Chain Risk Scorer | Premium Fields",
    description:
      "Is your cold chain putting your fruit at risk? Take the 10-question assessment.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
