
'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from "@/contexts/auth-context";
import { useSiteCustomization } from "@/contexts/site-customization-context";
import { usePosts } from "@/contexts/posts-context";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/shared/page-header';
import { ArrowLeft, Loader2, Shield, Mail, Newspaper, XIcon } from 'lucide-react';
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
}

async function fetchActiveBanners(): Promise<Banner[]> {
  const bannersRef = collection(db, "banners");
  const q = query(bannersRef, where("isActive", "==", true), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  const activeBanners: Banner[] = [];
  querySnapshot.forEach((doc) => {
    activeBanners.push({ id: doc.id, ...doc.data() } as Banner);
  });
  return activeBanners;
}


export default function PostPageClientContent({ slug, adminEmail }: PostPageClientContentProps) {
  const { currentUser, loading: authLoading } = useAuth();
  const { siteTitle } = useSiteCustomization();
  const { posts, getPostBySlug } = usePosts();
  const [post, setPost] = useState<Post | undefined | null>(undefined);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  const { data: activeBanners = [] } = useQuery<Banner[], Error>({
    queryKey: ['activeBanners'],
    queryFn: fetchActiveBanners,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const [showPopupBanner, setShowPopupBanner] = useState(false);
  const [popupBannerContent, setPopupBannerContent] = useState<string | null>(null);

  useEffect(() => {
    const foundPost = getPostBySlug(slug);
    setPost(foundPost || null);
  }, [slug, getPostBySlug, posts]);


  useEffect(() => {
    if (post?.title && siteTitle) {
      document.title = `${post.title} | ${siteTitle}`;
    } else if (siteTitle) {
      document.title = siteTitle;
    }
  }, [siteTitle, post?.title]);

  useEffect(() => {
    const popupBanner = activeBanners.find(b => b.placement === 'popup');
    if (popupBanner) {
      // Simple logic: show popup once per session using sessionStorage
      const popupShown = sessionStorage.getItem(`popupShown_${popupBanner.id}`);
      if (!popupShown) {
        setPopupBannerContent(popupBanner.contentHTML);
        setShowPopupBanner(true);
        sessionStorage.setItem(`popupShown_${popupBanner.id}`, 'true');
      }
    }
  }, [activeBanners]);


  const isAdmin = !authLoading && currentUser?.email === adminEmail;

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newsletterEmail) {
      toast({ title: "Email Mancante", description: "Per favore, inserisci un indirizzo email.", variant: "destructive" });
      return;
    }
    setIsSubscribing(true);
    try {
      await addDoc(collection(db, "newsletterSubscriptions"), {
        email: newsletterEmail,
        subscribedAt: serverTimestamp(),
      });
      toast({
        title: "Iscrizione Riuscita!",
        description: `Grazie per esserti iscritto con ${newsletterEmail}!`,
      });
      setNewsletterEmail('');
    } catch (error) {
      console.error('Errore durante liscrizione alla newsletter:', error);
      toast({
        title: "Errore Iscrizione",
        description: "Impossibile completare l'iscrizione. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const relatedPosts = useMemo(() => {
    if (!post || posts.length <= 1) {
      return [];
    }
    return posts
      .filter(p => p.id !== post.id)
      .slice(0, MAX_RELATED_POSTS);
  }, [post, posts]);

  const underTitleBanner = useMemo(() => activeBanners.find(b => b.placement === 'underTitle'), [activeBanners]);
  const afterContentBanner = useMemo(() => activeBanners.find(b => b.placement === 'afterContent'), [activeBanners]);


  if (authLoading || post === undefined) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    notFound();
    return null;
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

          {/* Under Title Banner */}
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
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* After Content Banner */}
          {afterContentBanner && (
            <div 
              className="my-8 p-4 border rounded-md shadow-sm bg-card"
              dangerouslySetInnerHTML={{ __html: afterContentBanner.contentHTML }}
            />
          )}
          
          <Card className="mt-12 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Mail className="mr-3 h-6 w-6 text-primary" />
                Iscriviti alla Newsletter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Rimani aggiornato con le ultime novità e articoli direttamente nella tua casella di posta.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
                <Label htmlFor="newsletter-email" className="sr-only">Email</Label>
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="La tua email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="flex-grow"
                  disabled={isSubscribing}
                />
                <Button type="submit" className="w-full sm:w-auto" disabled={isSubscribing}>
                  {isSubscribing ? <Loader2 className="animate-spin mr-2" /> : null}
                  Iscriviti
                </Button>
              </form>
            </CardContent>
          </Card>

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

        {/* Popup Banner */}
        {popupBannerContent && (
          <AlertDialog open={showPopupBanner} onOpenChange={setShowPopupBanner}>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                {/* <AlertDialogTitle>Annuncio</AlertDialogTitle> You can add a title if needed */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => setShowPopupBanner(false)}
                >
                    <XIcon className="h-4 w-4" />
                    <span className="sr-only">Chiudi</span>
                </Button>
              </AlertDialogHeader>
              <AlertDialogDescription asChild>
                <div dangerouslySetInnerHTML={{ __html: popupBannerContent }} />
              </AlertDialogDescription>
              {/* 
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowPopupBanner(false)}>Chiudi</AlertDialogCancel>
              </AlertDialogFooter>
              */}
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
