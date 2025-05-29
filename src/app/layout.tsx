import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google'; // Changed imports
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ // Changed to Inter
  variable: '--font-inter', // Changed variable name
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({ // Changed to Roboto_Mono
  variable: '--font-roboto-mono', // Changed variable name
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AutoContentAI',
  description: 'AI-powered content generation for your auto blog.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`} // Updated variables
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
