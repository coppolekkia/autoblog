// src/app/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic'; // Import next/dynamic
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { Loader2, Shield, UserCog, Home } from 'lucide-react'; // Added Home
import { useAuth } from "@/contexts/auth-context";
import { useSiteCustomization } from "@/contexts/site-customization-context";
import { CategoriesMenu } from '@/components/shared/categories-menu'; // Import CategoriesMenu

// !! IMPORTANTE !! Questo UID è stato rilevato dall'errore.
// !! DEVI USARE QUESTO UID NELLE TUE REGOLE DI SICUREZZA FIRESTORE !!!
// !! PER PERMETTERE ALL'ADMIN DI SCRIVERE NELLE COLLEZIONI 'banners', 'newsletterSubscriptions' ecc. !!!
// Questo DEVE corrispondere all'UID dell'utente admin in Firebase Authentication.
const ADMIN_UID_FOR_RULES = "ymIToxqAwnTk9vtqE4RuRIIrzkC3"; // UID per coppolek@gmail.com

const ADMIN_EMAIL = "coppolek@gmail.com";

// Dynamically import AdminNewsSiteView
const AdminNewsSiteView = dynamic(() => 
  import('@/components/admin/admin-news-site-view').then(mod => mod.AdminNewsSiteView), 
  { 
    loading: () => (
      <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    ),
    ssr: false // Admin panel is client-side heavy
  }
);

// Dynamically import BlogFeedView
const BlogFeedView = dynamic(() => 
  import('@/components/blog/blog-feed-view').then(mod => mod.BlogFeedView),
  { 
    loading: () => (
      <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    ),
    ssr: true // Blog feed can be SSR'd if needed, but dynamic for consistency here
  }
);


export default function HomePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { siteTitle } = useSiteCustomization();
  const isAdmin = !authLoading && currentUser?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (siteTitle) {
      document.title = siteTitle;
    }
  }, [siteTitle]);


  if (authLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background" data-page-id="home-page-main-wrapper">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center relative">
          {/* Left Slot - Empty on Home Page */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {/* Intentionally empty on the main homepage */}
          </div>

          {/* Centered Logo */}
          <div className="mx-auto">
            <Link href="/" className="flex items-center space-x-2">
              <UserCog className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl text-primary">{siteTitle}</span>
            </Link>
          </div>
          
          {/* Right Slot */}
          <nav className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-1 md:space-x-2">
            <CategoriesMenu />
            {currentUser ? (
              <>
                {isAdmin && (
                  <span className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-accent-foreground bg-accent px-2 py-1 rounded-md">
                    <Shield className="h-4 w-4" />
                    Admin
                  </span>
                )}
                <span className="text-sm text-foreground hidden md:inline truncate max-w-[100px] lg:max-w-[200px]">{currentUser.email}</span>
                {!isAdmin && ( 
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                )}
                 <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const { signOut: firebaseSignOut } = await import('firebase/auth');
                    const { auth } = await import('@/lib/firebase'); // auth is exported from firebase.ts
                    try {
                      await firebaseSignOut(auth);
                    } catch (error) {
                      console.error("Errore logout dall'header:", error);
                    }
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {isAdmin ? <AdminNewsSiteView adminUid={ADMIN_UID_FOR_RULES} /> : <BlogFeedView />}
      </main>

      <footer className="py-8 mt-12 border-t bg-background">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {siteTitle}. Tutti i diritti riservati.</p>
          <p className="text-sm">
            Powered by AI for a better driving content experience.
          </p>
        </div>
      </footer>
    </div>
  );
}
