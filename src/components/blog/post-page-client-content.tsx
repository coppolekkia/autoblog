
'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from "@/contexts/auth-context";
import { useSiteCustomization } from "@/contexts/site-customization-context";
import { usePosts } from "@/contexts/posts-context";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { ArrowLeft, Loader2, Shield, Newspaper, XIcon, AlertTriangle } from 'lucide-react';
import type { Post } from '@/types/blog';
import { notFound } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";


interface PostPageClientContentProps {
  slug: string;
  adminEmail: string;
}

const MAX_RELATED_POSTS = 3;

interface Banner {
  id: string;
  name: string;
  contentHTML: string;
  placement: 'underTitle' | 'afterContent' | 'popup';
  isActive: boolean;
  createdAt?: Timestamp;
}

async function fetchActiveBanners(): Promise<Banner[]> {
  console.log('[PostPageClientContent] Attempting to fetch active banners from Firestore...');
  try {
    const bannersRef = collection(db, "banners");
    const q = query(bannersRef, where("isActive", "==", true), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const activeBanners: Banner[] = [];
    querySnapshot.forEach((doc) => {
      activeBanners.push({ id: doc.id, ...doc.data() } as Banner);
    });
    console.log(`[PostPageClientContent] Fetched ${activeBanners.length} active banners.`);
    if (activeBanners.length === 0) {
      console.warn('[PostPageClientContent] No active banners found in Firestore. Check if banners exist and are marked as active, and verify security rules allow public read of active banners.');
    }
    return activeBanners;
  } catch (error: any) {
    console.error("[PostPageClientContent] Error fetching active banners from Firestore function:", error);
    if (error.code === 'permission-denied' || (error.message && error.message.toLowerCase().includes("permission denied"))) {
        console.error("[PostPageClientContent] Firestore permission denied while fetching banners. Please check your Firestore security rules for the 'banners' collection to allow public read access for documents where 'isActive' is true.");
    } else if (error.code === 'failed-precondition' || (error.message && error.message.toLowerCase().includes("requires an index"))) {
        console.error("[PostPageClientContent] Firestore query for banners requires an index. Please ensure the composite index (isActive ASC, createdAt DESC) is created and active in Firestore. Error details:", error.message);
    }
    throw error;
  }
}


export default function PostPageClientContent({ slug, adminEmail }: PostPageClientContentProps) {
  const { currentUser, loading: authLoading } = useAuth();
  const { siteTitle } = useSiteCustomization();
  const { posts, getPostBySlug } = usePosts();
  const [post, setPost] = useState<Post | undefined | null>(undefined);
  const { toast } = useToast();

  const { data: activeBanners = [], isLoading: isLoadingBanners, isError: isErrorBanners, error: bannersError } = useQuery<Banner[], Error>({
    queryKey: ['activeBanners', slug],
    queryFn: fetchActiveBanners,
    staleTime: 5 * 60 * 1000,
  });

  const [showPopupBanner, setShowPopupBanner] = useState(false);
  const [popupBannerContent, setPopupBannerContent] = useState<string | null>(null);

  useEffect(() => {
    const foundPost = getPostBySlug(slug);
    setPost(foundPost || null);
    if (!foundPost && !posts.length) {
        console.log("[PostPageClientContent] Post not found initially, posts array might be empty or loading.");
    } else if (!foundPost && posts.length > 0) {
        console.log(`[PostPageClientContent] Post with slug "${slug}" not found in PostsContext.`);
    }
  }, [slug, getPostBySlug, posts]);


  useEffect(() => {
    if (posts.length > 0 && post === null) {
        notFound();
    }
  }, [post, posts]);


  useEffect(() => {
    if (post?.title && siteTitle) {
      document.title = `${post.title} | ${siteTitle}`;
    } else if (siteTitle) {
      document.title = siteTitle;
    }
  }, [siteTitle, post?.title]);

  useEffect(() => {
    if (isLoadingBanners) {
      console.log('[PostPageClientContent] Banners are loading...');
    }
    if (isErrorBanners) {
      console.error('[PostPageClientContent] Error object from useQuery while loading banners:', bannersError);
    }
    if (!isLoadingBanners && !isErrorBanners) {
      console.log('[PostPageClientContent] Banners fetched (or cache used), count:', activeBanners.length);
      if (activeBanners.length === 0 && !isErrorBanners) {
        console.warn('[PostPageClientContent] No active banners found. Check Firestore data and security rules for "banners" collection.');
      }
      const popupBanner = activeBanners.find(b => b.placement === 'popup');
      if (popupBanner) {
        console.log('[PostPageClientContent] Popup banner found:', popupBanner.name);
        const popupShownKey = `popupShown_${popupBanner.id}_${slug}`;
        const popupShown = sessionStorage.getItem(popupShownKey);
        if (!popupShown) {
          console.log('[PostPageClientContent] Showing popup banner:', popupBanner.name);
          setPopupBannerContent(popupBanner.contentHTML);
          setShowPopupBanner(true);
          sessionStorage.setItem(popupShownKey, 'true');
        } else {
          console.log('[PostPageClientContent] Popup banner already shown this session for this post:', popupBanner.name);
        }
      } else {
        console.log('[PostPageClientContent] No active popup banner found.');
      }
    }
  }, [activeBanners, isLoadingBanners, isErrorBanners, bannersError, slug]);


  const isAdmin = !authLoading && currentUser?.email === adminEmail;

  const relatedPosts = useMemo(() => {
    if (!post || posts.length <= 1) {
      return [];
    }
    return posts
      .filter(p => p.id !== post.id)
      .slice(0, MAX_RELATED_POSTS);
  }, [post, posts]);

  const underTitleBanner = useMemo(() => activeBanners.find(b => b.placement === 'underTitle'), [activeBanners]);
  const afterContentBannerData = useMemo(() => activeBanners.find(b => b.placement === 'afterContent'), [activeBanners]);


  if (authLoading || post === undefined) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="ml-2">Caricamento post...</p>
        </div>
      );
  }

  const renderContentWithInArticleBanner = () => {
    if (!post.content) return null;

    const paragraphs = post.content.split(/\n\s*\n/);
    const bannerInsertionPoint = paragraphs.length > 1 ? 1 : 0;

    return (
      <>
        {paragraphs.slice(0, bannerInsertionPoint).map((p, i) => (
          <p key={`pre-banner-p-${i}`} className="whitespace-pre-wrap">{p}</p>
        ))}
        
        {afterContentBannerData && bannerInsertionPoint < paragraphs.length && (
          <div
            className="my-6 p-4 border rounded-md shadow-sm bg-card"
            dangerouslySetInnerHTML={{ __html: afterContentBannerData.contentHTML }}
          />
        )}
        
        {paragraphs.slice(bannerInsertionPoint).map((p, i) => (
          <p key={`post-banner-p-${i}`} className="whitespace-pre-wrap">{p}</p>
        ))}
        
        {afterContentBannerData && bannerInsertionPoint === paragraphs.length && paragraphs.length > 0 && (
           <div
            className="my-6 p-4 border rounded-md shadow-sm bg-card"
            dangerouslySetInnerHTML={{ __html: afterContentBannerData.contentHTML }}
          />
        )}
        
        {afterContentBannerData && paragraphs.length === 0 && (
           <div
            className="my-6 p-4 border rounded-md shadow-sm bg-card"
            dangerouslySetInnerHTML={{ __html: afterContentBannerData.contentHTML }}
          />
        )}
      </>
    );
  };


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
                      toast({ title: "Logout Effettuato", description: "Sei stato disconnesso." });
                    } catch (error) {
                      console.error("Errore logout dall'header del post:", error);
                       toast({ title: "Errore Logout", description: "Impossibile effettuare il logout.", variant: "destructive" });
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

        {isErrorBanners && (
          <div className="my-6 p-4 border border-destructive bg-destructive/10 text-destructive rounded-md shadow-sm flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p>
              Impossibile caricare i banner. Controlla la console del browser (F12) per dettagli sull'errore.
              Potrebbe essere un problema di permessi Firestore o indici mancanti per la collezione 'banners'.
            </p>
          </div>
        )}

        <article className="max-w-3xl mx-auto">
          <PageHeader title={post.title} />

          {underTitleBanner && (
            <div
              className="my-6 p-4 border rounded-md shadow-sm bg-card"
              dangerouslySetInnerHTML={{ __html: underTitleBanner.contentHTML }}
            />
          )}

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
            {afterContentBannerData ? renderContentWithInArticleBanner() : <p className="whitespace-pre-wrap">{post.content}</p>}
          </div>
          
          {/* Sezione Articoli Correlati */}
          {relatedPosts.length > 0 && (
            <Card className="mt-8 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Newspaper className="mr-3 h-5 w-5 text-primary" />
                  Articoli Correlati
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedPosts.map(relatedPost => (
                    <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group block">
                      <Card className="overflow-hidden h-full transition-all duration-300 ease-in-out group-hover:shadow-xl hover:border-primary/50">
                        {relatedPost.imageUrl && (
                          <div className="aspect-[16/9] overflow-hidden">
                            <Image
                              src={relatedPost.imageUrl}
                              alt={relatedPost.title}
                              width={300}
                              height={168}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              data-ai-hint={relatedPost.imageHint || relatedPost.title.split(' ').slice(0, 2).join(' ') || "related article"}
                            />
                          </div>
                        )}
                        <CardHeader className="p-4">
                          <CardTitle className="text-base font-semibold leading-tight line-clamp-2 group-hover:text-primary">
                            {relatedPost.title}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </article>

        {popupBannerContent && (
          <AlertDialog open={showPopupBanner} onOpenChange={setShowPopupBanner}>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader className="relative">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 z-10 rounded-full p-0"
                    onClick={() => setShowPopupBanner(false)}
                    aria-label="Chiudi popup"
                >
                    <XIcon className="h-4 w-4" />
                    <span className="sr-only">Chiudi</span>
                </Button>
              </AlertDialogHeader>
              <AlertDialogDescription asChild>
                <div dangerouslySetInnerHTML={{ __html: popupBannerContent }} />
              </AlertDialogDescription>
            </AlertDialogContent>
          </AlertDialog>
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
