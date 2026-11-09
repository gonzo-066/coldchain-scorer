import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cold Chain Risk Scorer | Axarat",
  description:
    "Answer 10 quick questions to get your Cold Chain Risk Score — and find out where your fresh fruit operation is most exposed.",
  openGraph: {
    title: "Cold Chain Risk Scorer | Axarat",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Manrope:wght@600;700;800&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-navy text-on-dark antialiased">
        {children}
      </body>
    </html>
  );
}
