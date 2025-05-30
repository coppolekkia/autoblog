
import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google'; 
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from "@/contexts/auth-context"; 
import { SiteCustomizationProvider } from '@/contexts/site-customization-context';
import { PostsProvider } from '@/contexts/posts-context';
import { ReactQueryClientProvider } from '@/components/shared/react-query-client-provider'; // Import QueryClientProvider
import { siteConfig } from '@/config/site'; 

const inter = Inter({ 
  variable: '--font-inter', 
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({ 
  variable: '--font-roboto-mono', 
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: siteConfig.name, 
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
        <ReactQueryClientProvider> {/* Wrap with QueryClientProvider */}
          <AuthProvider>
            <SiteCustomizationProvider>
              <PostsProvider>
                {children}
                <Toaster />
              </PostsProvider>
            </SiteCustomizationProvider>
          </AuthProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
