import { ReactNode } from 'react';
import { Metadata } from 'next';
import localFont from 'next/font/local';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

import './globals.css';

import { ThemeProvider } from '@/components/custom/theme-provider';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'DramaX - Dashboard',
  description: 'DramaX - Your Ultimate Movie and TV Show Companion',
  keywords: [],
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <ThemeProvider
            defaultTheme="dark"
            attribute="class"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-right" duration={1000} />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
