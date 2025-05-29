// src/app/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { siteConfig } from '@/config/site';
import { ArrowRight, MessageSquare, ThumbsUp, UserCog, Shield, Newspaper, Loader2 } from 'lucide-react'; // Changed UserShield
import { useAuth } from "@/contexts/auth-context";

// --- INIZIO IDENTIFICAZIONE ADMIN TEMPORANEA ---
// !! IMPORTANTE !!
// Questo è un metodo TEMPORANEO e NON SICURO per identificare un admin, solo a scopo dimostrativo.
// In un'applicazione di produzione, DEVI usare un metodo sicuro come Firebase Custom Claims
// o un ruolo memorizzato in un database backend sicuro.
// NON usare questo controllo email hardcodato in un'applicazione live.
const ADMIN_EMAIL = "admin@example.com"; // SOSTITUISCI con un'email che puoi usare per i test
// --- FINE IDENTIFICAZIONE ADMIN TEMPORANEA ---

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

// Nuovo componente per la Vista Admin
function AdminNewsSiteView() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <PageHeader
        title="Pannello Admin & News del Sito"
        description="Benvenuto, Admin! Ecco le ultime attività e gli strumenti di gestione."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Newspaper className="h-6 w-6 text-primary" />
              Gestione Contenuti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Gestisci articoli del blog, categorie e commenti.</p>
            <Button className="w-full" disabled>Gestisci Articoli (Presto)</Button>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserCog className="h-6 w-6 text-primary" /> {/* Changed from UserShield */}
              Gestione Utenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Visualizza e gestisci account utente e ruoli.</p>
            <Button className="w-full" disabled>Gestisci Utenti (Presto)</Button>
          </CardContent>
        </Card>
         <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ThumbsUp className="h-6 w-6 text-primary" /> {/* Potremmo usare BarChart per Analytics */}
              Statistiche Sito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Panoramica del traffico e dell'engagement.</p>
            <Button className="w-full" disabled>Vedi Statistiche (Presto)</Button>
          </CardContent>
        </Card>
      </div>
      <PageHeader
        title="Attività Recenti del Sito"
        description="Uno sguardo veloce alle novità."
      />
       <Card>
          <CardHeader><CardTitle>Feed Attività (Placeholder)</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Nuovo articolo: "Il Futuro delle Auto AI" da UtenteX - 2 ore fa</li>
              <li>Nuovo commento su "Elettrico vs Idrogeno" da UtenteY - 5 ore fa</li>
              <li>Nuovo utente registrato: utenteZ@email.com - 1 giorno fa</li>
            </ul>
          </CardContent>
        </Card>
    </div>
  );
}


export default function HomePage() {
  const { currentUser, loading } = useAuth();

  // !! Controllo Admin Temporaneo e NON SICURO !!
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
                    <Shield className="h-4 w-4" /> {/* Changed from UserShield */}
                    Admin Mode
                  </span>
                )}
                 <span className="text-sm text-foreground mr-2 hidden md:inline truncate max-w-[150px] lg:max-w-[250px]">{currentUser.email}</span>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                {/* Il logout è gestito dalla AppLayout, a cui si accede tramite /dashboard */}
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

      <main className="flex-1">
        {isAdmin ? (
          <AdminNewsSiteView />
        ) : (
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
        )}
      </main>

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
