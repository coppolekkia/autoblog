
import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google'; 
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from "@/contexts/auth-context"; 
import { SiteCustomizationProvider } from '@/contexts/site-customization-context'; // Importa SiteCustomizationProvider
import { siteConfig } from '@/config/site'; // Import siteConfig for default title

const inter = Inter({ 
  variable: '--font-inter', 
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({ 
  variable: '--font-roboto-mono', 
  subsets: ['latin'],
});

// Metadata will use the static config title initially
export const metadata: Metadata = {
  title: siteConfig.name, // Use default from config for initial SSR
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
        <AuthProvider>
          <SiteCustomizationProvider> {/* Avvolgi con SiteCustomizationProvider */}
            {children}
            <Toaster />
          </SiteCustomizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
