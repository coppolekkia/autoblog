import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google'; // Changed imports
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from "@/contexts/auth-context"; // Importa AuthProvider

const inter = Inter({ 
  variable: '--font-inter', 
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({ 
  variable: '--font-roboto-mono', 
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
    <html lang="it" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`}
      >
        <AuthProvider> {/* Avvolgi i children con AuthProvider */}
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
