import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HelixHD — Lead Enrichment Engine',
  description:
    'Enrich B2B leads at scale. Paste LinkedIn company URLs, get verified contacts with emails, titles, and phone numbers — powered by Apollo.io.',
  keywords: ['lead enrichment', 'B2B leads', 'LinkedIn', 'Apollo.io', 'sales intelligence'],
  openGraph: {
    title: 'HelixHD — Lead Enrichment Engine',
    description: 'Enrich B2B leads at scale using Apollo.io.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-slate-950 text-slate-200 antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
