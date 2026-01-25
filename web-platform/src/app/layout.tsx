
import type { Metadata } from 'next';
import './globals.css';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';

const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Wafir - Islamic Finance',
  description: 'Your Personal Islamic Finance Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${arabicFont.variable} antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
