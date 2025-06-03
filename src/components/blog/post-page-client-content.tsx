
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
import { ArrowLeft, Loader2, Shield, Newspaper, XIcon, AlertTriangle, UserCog, Home, List } from 'lucide-react'; // Added UserCog, Home, List
import type { Post } from '@/types/blog';
import { notFound } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { CategoriesMenu } from '@/components/shared/categories-menu'; // Import CategoriesMenu


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
    queryKey: ['activeBanners', slug], // Include slug in queryKey if banners might be post-specific
    queryFn: fetchActiveBanners,
    staleTime: 5 * 60 * 1000, // Banners are refetched every 5 mins
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
    if (posts.length > 0 && post === null) { // If posts are loaded but this specific post isn't found
        notFound();
    }
  }, [post, posts]);


  useEffect(() => {
    if (post?.title && siteTitle) {
      document.title = `${post.title} | ${siteTitle}`;
    } else if (siteTitle) {
      // Fallback if post title isn't available yet
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
        // This warning is normal if no active banners are configured.
        console.log('[PostPageClientContent] No active banners found. Check Firestore data and security rules for "banners" collection if you expect them.');
      }
      const popupBanner = activeBanners.find(b => b.placement === 'popup');
      if (popupBanner) {
        console.log('[PostPageClientContent] Popup banner found:', popupBanner.name);
        const popupShownKey = `popupShown_${popupBanner.id}_${slug}`; // Make key post-specific
        const popupShown = sessionStorage.getItem(popupShownKey);
        if (!popupShown) {
          console.log('[PostPageClientContent] Showing popup banner:', popupBanner.name);
          setPopupBannerContent(popupBanner.contentHTML);
          setShowPopupBanner(true);
          sessionStorage.setItem(popupShownKey, 'true'); // Mark as shown for this post in this session
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
    if (!post || !posts || posts.length <= 1) {
      return [];
    }
    // Filter related posts by category first, then slice.
    // If not enough in the same category, could fall back to other posts.
    const sameCategoryPosts = posts.filter(p => p.id !== post.id && p.category === post.category);
    if (sameCategoryPosts.length >= MAX_RELATED_POSTS) {
        return sameCategoryPosts.slice(0, MAX_RELATED_POSTS);
    }
    // If not enough, supplement with other posts (excluding current and already selected)
    const otherPosts = posts.filter(p => p.id !== post.id && p.category !== post.category);
    return [...sameCategoryPosts, ...otherPosts].slice(0, MAX_RELATED_POSTS);

  }, [post, posts]);

  const underTitleBanner = useMemo(() => activeBanners.find(b => b.placement === 'underTitle'), [activeBanners]);
  const afterContentBannerData = useMemo(() => activeBanners.find(b => b.placement === 'afterContent'), [activeBanners]);


  if (authLoading || post === undefined) { // Still loading auth or initial post lookup
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // If posts have loaded from context, and post is explicitly null (meaning not found by slug)
  if (!post) {
     // This case should ideally be handled by the useEffect that calls notFound(),
     // but as a fallback render a loading or not found message.
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="ml-2">Caricamento post o post non trovato...</p>
        </div>
      );
  }

  const renderContentWithInArticleBanner = () => {
    if (!post.content) return null;

    const paragraphs = post.content.split(/\n\s*\n/); // Split by one or more newlines
    // Try to insert banner after the first paragraph, or at the start if only one/no paragraphs
    const bannerInsertionPoint = paragraphs.length > 1 ? 1 : 0; 

    return (
      <>
        {paragraphs.slice(0, bannerInsertionPoint).map((p, i) => (
          <p key={`pre-banner-p-${i}`} className="whitespace-pre-wrap my-4">{p}</p>
        ))}
        
        {afterContentBannerData && bannerInsertionPoint < paragraphs.length && (
          <div
            className="my-6 p-4 border rounded-md shadow-sm bg-card/80" // Slightly different bg for banner
            dangerouslySetInnerHTML={{ __html: afterContentBannerData.contentHTML }}
          />
        )}
        
        {paragraphs.slice(bannerInsertionPoint).map((p, i) => (
          <p key={`post-banner-p-${i}`} className="whitespace-pre-wrap my-4">{p}</p>
        ))}
        
        {/* If banner point is at the end (or no paragraphs), render banner after all content */}
        {afterContentBannerData && bannerInsertionPoint === paragraphs.length && (
           <div
            className="my-6 p-4 border rounded-md shadow-sm bg-card/80"
            dangerouslySetInnerHTML={{ __html: afterContentBannerData.contentHTML }}
          />
        )}
      </>
    );
  };


  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 md:mr-2" />
                 <span className="hidden md:inline">Blog</span>
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
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8 px-4 md:px-6 lg:px-8">
        {/* Back button removed from here as it's in the header now */}

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
            {post.category && (
                <Link href={`/category/${post.category.toLowerCase().replace(/\s+/g, '-')}`} className="ml-2 inline-block rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80">
                    r/{post.category}
                </Link>
            )}
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
                priority // This is the main image of the page
              />
            </div>
          )}

          <div className="prose prose-lg dark:prose-invert max-w-none mb-8 bg-card p-6 rounded-lg shadow-md">
            {afterContentBannerData ? renderContentWithInArticleBanner() : <p className="whitespace-pre-wrap">{post.content}</p>}
          </div>
          
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
                      <Card className="overflow-hidden h-full transition-all duration-300 ease-in-out group-hover:shadow-xl hover:border-primary/50 bg-card hover:bg-card/95">
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
              <AlertDialogHeader className="relative pt-2 pr-2"> {/* Adjust padding for close button */}
                {/* Close button moved inside, so no separate title needed if banner has its own */}
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
                {/* Ensure banner content is not too large for a popup */}
                <div className="p-4 max-h-[70vh] overflow-y-auto" dangerouslySetInnerHTML={{ __html: popupBannerContent }} />
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
