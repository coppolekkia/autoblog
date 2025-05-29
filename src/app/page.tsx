// src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { siteConfig } from '@/config/site';
import { ArrowRight, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react'; // Aggiunto MessageSquare e altri icone

// Placeholder data for blog posts
const placeholderPosts = [
  {
    id: 1,
    title: "Le Ultime Novità nel Mondo Automotive del 2024",
    slug: "novita-automotive-2024",
    excerpt: "Scopri le tendenze più calde, i modelli più attesi e le tecnologie emergenti che stanno definendo il futuro dell'auto.",
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
    imageUrl: "https://placehold.co/700x400.png",
    imageHint: "suv lineup",
    date: "5 Luglio 2024",
    author: "Giulia Bianchi",
    upvotes: 210,
    commentsCount: 45,
    category: "Recensioni"
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      {/* Public Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">{siteConfig.name}</span>
          </Link>
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button variant="default" asChild>
              <Link href="/register">Registrati</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
          <PageHeader
            title="Feed Principale"
            description="Esplora gli ultimi articoli e discussioni dalla community."
          />
          
          <section className="max-w-3xl mx-auto">
            {placeholderPosts.map((post) => (
              <Card key={post.id} className="mb-6 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-card">
                <div className="p-5">
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    {post.category && (
                      <Link href={`/category/${post.category.toLowerCase()}`} className="font-semibold text-primary hover:underline mr-2">
                        r/{post.category}
                      </Link>
                    )}
                    <span>Pubblicato da </span>
                    <Link href={`/user/${post.author.toLowerCase().replace(' ','-')}`} className="font-medium hover:underline ml-1 mr-1">
                      {post.author}
                    </Link>
                    <span>• {post.date}</span>
                  </div>

                  <CardTitle className="text-xl mb-3">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </CardTitle>

                  {post.imageUrl && (
                    <Link href={`/blog/${post.slug}`} aria-label={`Leggi di più su ${post.title}`} className="block mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        width={700}
                        height={400}
                        className="w-full h-auto object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                        data-ai-hint={post.imageHint}
                      />
                    </Link>
                  )}
                  
                  <p className="text-sm text-foreground/90 mb-4 line-clamp-3">{post.excerpt}</p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary px-2">
                        <ThumbsUp className="mr-1 h-4 w-4" />
                        <span>{post.upvotes}</span>
                      </Button>
                       {/* <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8">
                        <ThumbsDown className="h-4 w-4" />
                      </Button> */}
                      <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                        <Link href={`/blog/${post.slug}#comments`}>
                          <MessageSquare className="mr-1 h-4 w-4" />
                          <span>{post.commentsCount} Commenti</span>
                        </Link>
                      </Button>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/blog/${post.slug}`}>
                        Leggi e Commenta <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </section>
        </div>
      </main>

      {/* Public Footer */}
      <footer className="py-8 mt-12 border-t bg-background">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. Tutti i diritti riservati.</p>
          <p className="text-sm">
            Powered by AI for a better driving content experience.
          </p>
        </div>
      </footer>
    </div>
  );
}
