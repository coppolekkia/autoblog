
// src/app/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// siteConfig non è più usato qui per il nome, useremo il context
import { ArrowRight, MessageSquare, ThumbsUp, Shield, Loader2, Rss, Palette, Edit3 } from 'lucide-react';
import { useAuth } from "@/contexts/auth-context";
import { useSiteCustomization } from "@/contexts/site-customization-context"; 

// --- INIZIO IDENTIFICAZIONE ADMIN TEMPORANEA ---
const ADMIN_EMAIL = "coppolek@gmail.com"; 
// --- FINE IDENTIFICAZIONE ADMIN TEMPORANEA ---

// Placeholder data for blog posts (rimane per BlogFeedView)
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

// Componente per la Vista Admin
function AdminNewsSiteView() {
  const { 
    siteTitle: currentGlobalTitle, 
    setSiteTitleState, 
    bgHue: currentGlobalBgHue, 
    setBgHueState, 
    bgSaturation: currentGlobalBgSaturation, 
    setBgSaturationState, 
    bgLightness: currentGlobalBgLightness, 
    setBgLightnessState,
    cardHue: currentGlobalCardHue,
    setCardHueState,
    cardSaturation: currentGlobalCardSaturation,
    setCardSaturationState,
    cardLightness: currentGlobalCardLightness,
    setCardLightnessState,
    applyCustomization 
  } = useSiteCustomization();

  const [localTitle, setLocalTitle] = useState(currentGlobalTitle);
  
  const [localBgHue, setLocalBgHue] = useState(currentGlobalBgHue);
  const [localBgSaturation, setLocalBgSaturation] = useState(currentGlobalBgSaturation);
  const [localBgLightness, setLocalBgLightness] = useState(currentGlobalBgLightness);

  const [localCardHue, setLocalCardHue] = useState(currentGlobalCardHue);
  const [localCardSaturation, setLocalCardSaturation] = useState(currentGlobalCardSaturation);
  const [localCardLightness, setLocalCardLightness] = useState(currentGlobalCardLightness);

  const [isSaving, setIsSaving] = useState(false);

  // Sincronizza lo stato locale se lo stato globale cambia
  useEffect(() => setLocalTitle(currentGlobalTitle), [currentGlobalTitle]);
  
  useEffect(() => setLocalBgHue(currentGlobalBgHue), [currentGlobalBgHue]);
  useEffect(() => setLocalBgSaturation(currentGlobalBgSaturation), [currentGlobalBgSaturation]);
  useEffect(() => setLocalBgLightness(currentGlobalBgLightness), [currentGlobalBgLightness]);

  useEffect(() => setLocalCardHue(currentGlobalCardHue), [currentGlobalCardHue]);
  useEffect(() => setLocalCardSaturation(currentGlobalCardSaturation), [currentGlobalCardSaturation]);
  useEffect(() => setLocalCardLightness(currentGlobalCardLightness), [currentGlobalCardLightness]);

  const handleSaveChanges = () => {
    setIsSaving(true);
    setSiteTitleState(localTitle);
    
    setBgHueState(localBgHue);
    setBgSaturationState(localBgSaturation);
    setBgLightnessState(localBgLightness);

    setCardHueState(localCardHue);
    setCardSaturationState(localCardSaturation);
    setCardLightnessState(localCardLightness);
    
    applyCustomization(); 
    setTimeout(() => setIsSaving(false), 500); 
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <PageHeader
        title="Pannello Admin & News del Sito"
        description="Benvenuto, Admin! Ecco le ultime attività e gli strumenti di gestione."
      />
      <div className="grid md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] gap-8 mt-8">
        <aside className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Rss className="h-6 w-6 text-primary" />
                Gestione Feed URL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="feedUrl" className="text-muted-foreground">Aggiungi o Modifica URL Feed RSS/Atom</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="feedUrl" type="url" placeholder="https://esempio.com/feed.xml" className="flex-grow" />
                  <Button disabled>Salva URL</Button> 
                </div>
                <p className="text-xs text-muted-foreground mt-1">Inserisci l'URL completo del feed che vuoi aggiungere.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Palette className="h-6 w-6 text-primary" />
                Personalizzazione Sito
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteTitleInput">Titolo del Sito</Label>
                <Input 
                  id="siteTitleInput" 
                  type="text" 
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  placeholder="Il Mio Fantastico Blog" 
                  className="mt-1" 
                />
              </div>
              
              <div className="space-y-1">
                <Label>Colore Sfondo Principale (HSL)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="bgHue" className="text-xs text-muted-foreground">H (0-360)</Label>
                    <Input id="bgHue" type="number" min="0" max="360" value={localBgHue} onChange={(e) => setLocalBgHue(e.target.value)} placeholder="45" />
                  </div>
                  <div>
                    <Label htmlFor="bgSaturation" className="text-xs text-muted-foreground">S (0-100)</Label>
                    <Input id="bgSaturation" type="number" min="0" max="100" value={localBgSaturation} onChange={(e) => setLocalBgSaturation(e.target.value)} placeholder="25" />
                  </div>
                  <div>
                    <Label htmlFor="bgLightness" className="text-xs text-muted-foreground">L (0-100)</Label>
                    <Input id="bgLightness" type="number" min="0" max="100" value={localBgLightness} onChange={(e) => setLocalBgLightness(e.target.value)} placeholder="96" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Colore Sfondo Contenuto (HSL)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="cardHue" className="text-xs text-muted-foreground">H (0-360)</Label>
                    <Input id="cardHue" type="number" min="0" max="360" value={localCardHue} onChange={(e) => setLocalCardHue(e.target.value)} placeholder="45" />
                  </div>
                  <div>
                    <Label htmlFor="cardSaturation" className="text-xs text-muted-foreground">S (0-100)</Label>
                    <Input id="cardSaturation" type="number" min="0" max="100" value={localCardSaturation} onChange={(e) => setLocalCardSaturation(e.target.value)} placeholder="25" />
                  </div>
                  <div>
                    <Label htmlFor="cardLightness" className="text-xs text-muted-foreground">L (0-100)</Label>
                    <Input id="cardLightness" type="number" min="0" max="100" value={localCardLightness} onChange={(e) => setLocalCardLightness(e.target.value)} placeholder="96" />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full mt-2">
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Edit3 className="mr-2 h-4 w-4" />}
                Salva Personalizzazioni
              </Button>
            </CardContent>
          </Card>

        </aside>

        <section className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Attività Recenti del Sito</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Nuovo articolo: "Il Futuro delle Auto AI" da UtenteX - 2 ore fa</li>
                <li>Nuovo commento su "Elettrico vs Idrogeno" da UtenteY - 5 ore fa</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

// Componente per il Feed del Blog (per utenti non admin o non loggati)
function BlogFeedView() {
  return (
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
                    data-ai-hint={post.imageHint || "blog image"}
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
  );
}


export default function HomePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { siteTitle } = useSiteCustomization(); // Ottieni il titolo del sito dal context
  const isAdmin = !authLoading && currentUser?.email === ADMIN_EMAIL;

  // Effetto per aggiornare document.title quando siteTitle dal context cambia
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
                        console.error("Errore logout dall'header:", error);
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

      <main className="flex-1">
        {isAdmin ? <AdminNewsSiteView /> : <BlogFeedView />}
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
