// src/components/category/category-client-page.tsx
"use client";

import React, { useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// useParams removed as slug is passed as prop
// notFound removed, will show a message instead
import { usePosts } from '@/contexts/posts-context';
import { useSiteCustomization } from '@/contexts/site-customization-context';
import type { Post } from '@/types/blog';
import { slugify } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare, ThumbsUp, LayoutGrid, Home, UserCog, Shield, List } from 'lucide-react';
import { useAuth } from "@/contexts/auth-context";
import { CategoriesMenu } from '@/components/shared/categories-menu'; // Import CategoriesMenu

const ADMIN_EMAIL = "coppolek@gmail.com"; // Should be from a shared config

interface CategoryClientPageProps {
  categorySlug: string;
}

export default function CategoryClientPage({ categorySlug }: CategoryClientPageProps) {
  const { posts } = usePosts();
  const { siteTitle } = useSiteCustomization();
  const { currentUser, loading: authLoading } = useAuth();

  const categoryName = useMemo(() => {
    if (!categorySlug || !posts || posts.length === 0) return null;
    const postInCat = posts.find(p => p.category && slugify(p.category) === categorySlug);
    if (postInCat && postInCat.category) return postInCat.category;
    // Fallback: de-slugify if no exact match found (e.g. if category name had special chars removed by slugify)
    return categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, [categorySlug, posts]);

  const filteredPosts = useMemo(() => {
    if (!categorySlug || !posts) return [];
    return posts.filter(post => post.category && slugify(post.category) === categorySlug);
  }, [posts, categorySlug]);

  useEffect(() => {
    if (categoryName && siteTitle) {
      document.title = `${categoryName} | ${siteTitle}`;
    } else if (siteTitle) {
      document.title = `Categoria | ${siteTitle}`;
    }
  }, [categoryName, siteTitle]);

  const isAdmin = !authLoading && currentUser?.email === ADMIN_EMAIL;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <Home className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Homepage</span>
              </Link>
            </Button>
          </div>
          <div className="mx-auto">
            <Link href="/" className="flex items-center space-x-2">
              <UserCog className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl text-primary">{siteTitle}</span>
            </Link>
          </div>
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
                    const { auth } = await import('@/lib/firebase');
                    try {
                      await firebaseSignOut(auth);
                    } catch (error) {
                      console.error("Errore logout:", error);
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

      <main className="flex-1 container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <PageHeader
          title={categoryName || "Categoria non trovata"}
          description={categoryName ? `Articoli nella categoria "${categoryName}"` : "Sfoglia articoli."}
        />

        {filteredPosts.length > 0 ? (
          <section className="max-w-4xl mx-auto space-y-8 mt-8">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card flex flex-col">
                {post.imageUrl && (
                  <Link href={`/blog/${post.slug}`} aria-label={`Leggi di più su ${post.title}`} className="block overflow-hidden">
                    <Image
                      src={post.imageUrl}
                      alt={post.imageHint || post.title}
                      width={800}
                      height={450}
                      className="w-full h-auto object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                      data-ai-hint={post.imageHint || "blog image"}
                      priority={false} // Avoid multiple priority images on one page
                    />
                  </Link>
                )}
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center text-xs text-muted-foreground mb-3">
                    {post.category && (
                      <Badge variant="secondary" className="mr-2">
                        {/* No link needed as we are on the category page */}
                        {post.category}
                      </Badge>
                    )}
                    <span>Pubblicato da </span>
                    {/* User profile links could be a future feature */}
                    <span className="font-medium ml-1 mr-1">{post.author}</span>
                    <span>• {post.date}</span>
                  </div>

                  <CardTitle className="text-2xl font-semibold mb-3">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </CardTitle>

                  <p className="text-base text-foreground/80 mb-6 line-clamp-4 flex-grow">{post.excerpt}</p>

                  <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-border/50">
                    <div className="flex items-center space-x-3">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary px-2">
                        <ThumbsUp className="mr-1.5 h-4 w-4" />
                        <span>{post.upvotes}</span>
                      </Button>
                       <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                         <Link href={`/blog/${post.slug}#comments`}>
                          <span className="inline-flex items-center">
                            <MessageSquare className="mr-1.5 h-4 w-4" />
                            <span>{post.commentsCount} Commenti</span>
                          </span>
                        </Link>
                      </Button>
                    </div>
                    <Button asChild variant="default" size="sm">
                      <Link href={`/blog/${post.slug}`}>
                         <span className="inline-flex items-center">
                            Leggi di più
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </section>
        ) : (
          <div className="text-center mt-12">
            <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {categoryName ? `Nessun articolo trovato nella categoria "${categoryName}".` : "Categoria non trovata o nessun articolo disponibile."}
            </p>
            <Button asChild variant="link" className="mt-4">
              <Link href="/">Torna alla Homepage</Link>
            </Button>
          </div>
        )}
      </main>

      <footer className="py-8 mt-12 border-t bg-background">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {siteTitle}. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
}
