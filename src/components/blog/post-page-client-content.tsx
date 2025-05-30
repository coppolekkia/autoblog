
'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/auth-context";
import { useSiteCustomization } from "@/contexts/site-customization-context";
import { usePosts } from "@/contexts/posts-context"; // Import usePosts
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { ArrowLeft, ThumbsUp, MessageSquare, Loader2, Shield } from 'lucide-react';
import type { Post } from '@/types/blog';
import { notFound } from 'next/navigation'; // Import notFound

interface PostPageClientContentProps {
  slug: string; // Pass slug instead of the whole post object
  adminEmail: string;
}

export default function PostPageClientContent({ slug, adminEmail }: PostPageClientContentProps) {
  const { currentUser, loading: authLoading } = useAuth();
  const { siteTitle } = useSiteCustomization();
  const { getPostBySlug } = usePosts(); // Get posts from context
  const [post, setPost] = useState<Post | undefined | null>(undefined); // undefined: loading, null: not found

  useEffect(() => {
    const foundPost = getPostBySlug(slug);
    setPost(foundPost || null); // Set to null if not found after checking
  }, [slug, getPostBySlug]);


  // Update document title
  useEffect(() => {
    if (post?.title && siteTitle) {
      document.title = `${post.title} | ${siteTitle}`;
    } else if (siteTitle) {
      document.title = siteTitle; // Fallback to siteTitle if post not loaded/found
    }
  }, [siteTitle, post?.title]);

  const isAdmin = !authLoading && currentUser?.email === adminEmail;

  if (authLoading || post === undefined) { // Show loader while auth or post is loading
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) { // If post is null (not found after trying)
    notFound(); // Trigger the not-found UI
    return null; // Should be unreachable due to notFound()
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">{siteTitle}</span>
          </Link>
          <nav className="flex items-center space-x-2">
            {currentUser ? (
              <>
                {isAdmin && (
                  <span className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-accent-foreground bg-accent px-2 py-1 rounded-md mr-2">
                    <Shield className="h-4 w-4" />
                    Admin Mode
                  </span>
                )}
                 <span className="text-sm text-foreground mr-2 hidden md:inline truncate max-w-[150px] lg:max-w-[250px]">{currentUser.email}</span>
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
                        console.error("Errore logout dall'header del post:", error);
                      }
                    }}
                  >
                    Logout
                  </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                {/* Pulsante Registrati rimosso */}
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna al Blog
            </Link>
          </Button>
        </div>

        <article className="max-w-3xl mx-auto">
          <PageHeader title={post.title} />
          
          <div className="mb-4 text-sm text-muted-foreground">
            <span>Pubblicato da </span>
            <span className="font-medium">{post.author}</span>
            <span> il {post.date}</span>
            {post.category && <span className="ml-2 inline-block rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">r/{post.category}</span>}
          </div>

          {post.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={post.imageUrl}
                alt={post.title}
                width={700}
                height={400}
                className="w-full h-auto object-cover"
                data-ai-hint={post.imageHint || "blog image"}
                priority 
              />
            </div>
          )}

          <div className="prose prose-lg dark:prose-invert max-w-none mb-8 bg-card p-6 rounded-lg shadow-md">
            <p>{post.content}</p> 
          </div>

          <Card className="mt-12 shadow-lg" id="comments">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <MessageSquare className="mr-2 h-6 w-6 text-primary" />
                Commenti ({post.commentsCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {currentUser ? "Lascia un commento:" : "Accedi per lasciare un commento."}
              </p>
              <div className="border-t pt-4">
                {/* TODO: Implement comment form and list */}
                <p className="text-sm text-center text-muted-foreground">
                  (Sezione commenti in costruzione)
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex items-center space-x-2 text-sm text-muted-foreground border-t pt-4 mt-4">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary px-2">
                    <ThumbsUp className="mr-1 h-4 w-4" />
                    <span>{post.upvotes}</span>
                </Button>
            </CardFooter>
          </Card>
        </article>
      </main>

      <footer className="py-8 mt-12 border-t bg-background">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {siteTitle}. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
}
