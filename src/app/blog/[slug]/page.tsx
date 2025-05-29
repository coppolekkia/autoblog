
// src/app/blog/[slug]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { siteConfig } from '@/config/site';
import { useAuth } from "@/contexts/auth-context"; // We'll need this for header and comments later
import { ArrowLeft, ThumbsUp, MessageSquare, Loader2, Shield } from 'lucide-react';

// --- INIZIO IDENTIFICAZIONE ADMIN TEMPORANEA ---
// !! IMPORTANTE !! Replicato da src/app/page.tsx per coerenza nell'header
const ADMIN_EMAIL = "coppolek@gmail.com";
// --- FINE IDENTIFICAZIONE ADMIN TEMPORANEA ---

// Placeholder data for blog posts (replicated from src/app/page.tsx for now)
// In a real app, this would come from a CMS or database
const placeholderPosts = [
  {
    id: 1,
    title: "Le Ultime Novità nel Mondo Automotive del 2024",
    slug: "novita-automotive-2024",
    excerpt: "Scopri le tendenze più calde, i modelli più attesi e le tecnologie emergenti che stanno definendo il futuro dell'auto.",
    content: "Questo è il contenuto completo dell'articolo sulle novità automotive del 2024. Qui troverai un'analisi approfondita delle nuove tecnologie, dei design più innovativi e delle aspettative di mercato per i prossimi anni. Parleremo di veicoli elettrici, guida autonoma, sostenibilità e molto altro ancora. Continua a leggere per scoprire cosa ci riserva il futuro!",
    imageUrl: "https://placehold.co/700x400.png",
    imageHint: "modern car concept",
    date: "15 Luglio 2024",
    author: "AutoContentAI Team",
    upvotes: 125,
    commentsCount: 23,
    category: "Novità"
  },
  {
    id: 2,
    title: "Guida Completa alla Manutenzione della Tua Auto Elettrica",
    slug: "manutenzione-auto-elettrica",
    excerpt: "Consigli pratici e suggerimenti per mantenere la tua auto elettrica in perfette condizioni e massimizzare la durata della batteria.",
    content: "La manutenzione di un'auto elettrica differisce significativamente da quella di un veicolo tradizionale. In questa guida completa, esploreremo tutti gli aspetti: dalla cura della batteria, ai controlli dei sistemi elettrici, fino alla manutenzione di freni e pneumatici. Imparerai come estendere la vita della tua auto e viaggiare in sicurezza.",
    imageUrl: "https://placehold.co/700x400.png",
    imageHint: "electric car maintenance",
    date: "10 Luglio 2024",
    author: "Mario Rossi",
    upvotes: 98,
    commentsCount: 15,
    category: "Guide Pratiche"
  },
  {
    id: 3,
    title: "I SUV più Affidabili sul Mercato: Classifica e Recensioni",
    slug: "suv-affidabili-recensioni",
    excerpt: "Una panoramica dettagliata dei SUV che si distinguono per affidabilità, sicurezza e prestazioni. Trova il modello giusto per te.",
    content: "Scegliere un SUV affidabile è fondamentale per la tranquillità e la sicurezza della famiglia. In questo articolo, analizziamo i modelli più recenti, confrontando test di affidabilità, valutazioni di sicurezza, feedback dei proprietari e costi di manutenzione. Scopri la nostra classifica e le recensioni dettagliate per fare la scelta migliore.",
    imageUrl: "https://placehold.co/700x400.png",
    imageHint: "suv lineup",
    date: "5 Luglio 2024",
    author: "Giulia Bianchi",
    upvotes: 210,
    commentsCount: 45,
    category: "Recensioni"
  },
];

type PostPageProps = {
  params: {
    slug: string;
  };
};

// Function to get post data based on slug
async function getPostBySlug(slug: string) {
  return placeholderPosts.find((post) => post.slug === slug);
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post non Trovato',
    };
  }

  return {
    title: `${post.title} | ${siteConfig.name}`,
    description: post.excerpt,
    openGraph: {
        title: post.title,
        description: post.excerpt,
        type: 'article',
        url: `${siteConfig.url}/blog/${post.slug}`,
        images: [
            {
                url: post.imageUrl || siteConfig.ogImage, // Fallback to site OG image
                width: 1200,
                height: 630,
                alt: post.title,
            },
        ],
    },
  };
}


// Client component to handle auth state for header
function PageClientContent({ post }: { post: (typeof placeholderPosts)[0] }) {
  const { currentUser, loading } = useAuth();
  const isAdmin = !loading && currentUser?.email === ADMIN_EMAIL;

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">{siteConfig.name}</span>
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
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link href="/register">Registrati</Link>
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
                data-ai-hint={post.imageHint}
                priority // Prioritize loading for LCP on post page
              />
            </div>
          )}

          <div className="prose prose-lg dark:prose-invert max-w-none mb-8 bg-card p-6 rounded-lg shadow-md">
            {/* Replace excerpt with post.content when available */}
            <p>{post.content || post.excerpt}</p> 
          </div>

          {/* Placeholder for comments section */}
          <Card className="mt-12 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <MessageSquare className="mr-2 h-6 w-6 text-primary" />
                Commenti ({post.commentsCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Accedi per lasciare un commento.
              </p>
              {/* Comment form and list will go here */}
              <div className="border-t pt-4">
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
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
}


export default async function SinglePostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound(); // Triggers the not-found.tsx page or a default 404
  }
  
  // To use hooks like useAuth, we need a client component.
  // So we fetch data in the Server Component and pass it to a Client Component.
  return <PageClientContent post={post} />;
}


    