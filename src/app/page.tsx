
// src/app/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, MessageSquare, ThumbsUp, Shield, Loader2, Rss, Palette, Edit3, Sparkles, ListChecks, ExternalLink } from 'lucide-react'; // Aggiunte ListChecks, ExternalLink
import { useAuth } from "@/contexts/auth-context";
import { useSiteCustomization } from "@/contexts/site-customization-context"; 
import { processBlogPost, type ProcessBlogPostInput, type ProcessBlogPostOutput } from "@/ai/flows/process-blog-post";
import { fetchFeedItems, type FetchFeedItemsInput, type FetchFeedItemsOutput, type FeedItem } from "@/ai/flows/fetch-feed-items"; // Importa per i feed
import { useToast } from "@/hooks/use-toast";

// --- INIZIO IDENTIFICAZIONE ADMIN TEMPORANEA ---
const ADMIN_EMAIL = "coppolek@gmail.com"; 
// --- FINE IDENTIFICAZIONE ADMIN TEMPORANEA ---

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
    primaryHue: currentGlobalPrimaryHue,
    setPrimaryHueState,
    primarySaturation: currentGlobalPrimarySaturation,
    setPrimarySaturationState,
    primaryLightness: currentGlobalPrimaryLightness,
    setPrimaryLightnessState,
    primaryFgHue: currentGlobalPrimaryFgHue,
    setPrimaryFgHueState,
    primaryFgSaturation: currentGlobalPrimaryFgSaturation,
    setPrimaryFgSaturationState,
    primaryFgLightness: currentGlobalPrimaryFgLightness,
    setPrimaryFgLightnessState,
    applyCustomization 
  } = useSiteCustomization();

  const { toast } = useToast();

  const [localTitle, setLocalTitle] = useState(currentGlobalTitle);
  
  const [localBgHue, setLocalBgHue] = useState(currentGlobalBgHue);
  const [localBgSaturation, setLocalBgSaturation] = useState(currentGlobalBgSaturation);
  const [localBgLightness, setLocalBgLightness] = useState(currentGlobalBgLightness);

  const [localCardHue, setLocalCardHue] = useState(currentGlobalCardHue);
  const [localCardSaturation, setLocalCardSaturation] = useState(currentGlobalCardSaturation);
  const [localCardLightness, setLocalCardLightness] = useState(currentGlobalCardLightness);

  const [localPrimaryHue, setLocalPrimaryHue] = useState(currentGlobalPrimaryHue);
  const [localPrimarySaturation, setLocalPrimarySaturation] = useState(currentGlobalPrimarySaturation);
  const [localPrimaryLightness, setLocalPrimaryLightness] = useState(currentGlobalPrimaryLightness);

  const [localPrimaryFgHue, setLocalPrimaryFgHue] = useState(currentGlobalPrimaryFgHue);
  const [localPrimaryFgSaturation, setLocalPrimaryFgSaturation] = useState(currentGlobalPrimaryFgSaturation);
  const [localPrimaryFgLightness, setLocalPrimaryFgLightness] = useState(currentGlobalPrimaryFgLightness);

  const [isSavingCustomizations, setIsSavingCustomizations] = useState(false);

  const [originalPostTitle, setOriginalPostTitle] = useState("");
  const [originalPostContent, setOriginalPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("");
  const [isProcessingPost, setIsProcessingPost] = useState(false);
  const [processedPostData, setProcessedPostData] = useState<ProcessBlogPostOutput | null>(null);

  const [feedUrl, setFeedUrl] = useState("");
  const [isFetchingFeed, setIsFetchingFeed] = useState(false);
  const [fetchedFeedItems, setFetchedFeedItems] = useState<FeedItem[]>([]);


  useEffect(() => setLocalTitle(currentGlobalTitle), [currentGlobalTitle]);
  useEffect(() => setLocalBgHue(currentGlobalBgHue), [currentGlobalBgHue]);
  useEffect(() => setLocalBgSaturation(currentGlobalBgSaturation), [currentGlobalBgSaturation]);
  useEffect(() => setLocalBgLightness(currentGlobalBgLightness), [currentGlobalBgLightness]);
  useEffect(() => setLocalCardHue(currentGlobalCardHue), [currentGlobalCardHue]);
  useEffect(() => setLocalCardSaturation(currentGlobalCardSaturation), [currentGlobalCardSaturation]);
  useEffect(() => setLocalCardLightness(currentGlobalCardLightness), [currentGlobalCardLightness]);
  useEffect(() => setLocalPrimaryHue(currentGlobalPrimaryHue), [currentGlobalPrimaryHue]);
  useEffect(() => setLocalPrimarySaturation(currentGlobalPrimarySaturation), [currentGlobalPrimarySaturation]);
  useEffect(() => setLocalPrimaryLightness(currentGlobalPrimaryLightness), [currentGlobalPrimaryLightness]);
  useEffect(() => setLocalPrimaryFgHue(currentGlobalPrimaryFgHue), [currentGlobalPrimaryFgHue]);
  useEffect(() => setLocalPrimaryFgSaturation(currentGlobalPrimaryFgSaturation), [currentGlobalPrimaryFgSaturation]);
  useEffect(() => setLocalPrimaryFgLightness(currentGlobalPrimaryFgLightness), [currentGlobalPrimaryFgLightness]);

  const handleSaveCustomizations = () => {
    setIsSavingCustomizations(true);
    setSiteTitleState(localTitle);
    setBgHueState(localBgHue);
    setBgSaturationState(localBgSaturation);
    setBgLightnessState(localBgLightness);
    setCardHueState(localCardHue);
    setCardSaturationState(localCardSaturation);
    setCardLightnessState(localCardLightness);
    setPrimaryHueState(localPrimaryHue);
    setPrimarySaturationState(localPrimarySaturation);
    setPrimaryLightnessState(localPrimaryLightness);
    setPrimaryFgHueState(localPrimaryFgHue);
    setPrimaryFgSaturationState(localPrimaryFgSaturation);
    setPrimaryFgLightnessState(localPrimaryFgLightness);
    
    applyCustomization(); 
    toast({ title: "Personalizzazioni Salvate", description: "Le modifiche sono state applicate." });
    setTimeout(() => setIsSavingCustomizations(false), 500); 
  };

  const handleProcessPost = async () => {
    if (!originalPostTitle || !originalPostContent || !postCategory) {
      toast({ title: "Campi Mancanti", description: "Per favore, compila titolo, contenuto e categoria.", variant: "destructive" });
      return;
    }
    setIsProcessingPost(true);
    setProcessedPostData(null);
    try {
      const input: ProcessBlogPostInput = {
        originalTitle: originalPostTitle,
        originalContent: originalPostContent,
        category: postCategory,
      };
      const result = await processBlogPost(input);
      setProcessedPostData(result);
      toast({ title: "Post Elaborato!", description: "Il post è stato processato con successo dall'AI." });
    } catch (error) {
      console.error("Errore durante l'elaborazione del post:", error);
      toast({ title: "Errore Elaborazione", description: (error as Error).message || "Si è verificato un errore.", variant: "destructive" });
    } finally {
      setIsProcessingPost(false);
    }
  };

  const handleFetchFeed = async () => {
    if (!feedUrl) {
      toast({ title: "URL Mancante", description: "Per favore, inserisci un URL per il feed.", variant: "destructive" });
      return;
    }
    setIsFetchingFeed(true);
    setFetchedFeedItems([]);
    try {
      const input: FetchFeedItemsInput = { feedUrl };
      const result: FetchFeedItemsOutput = await fetchFeedItems(input);
      if (result.error) {
        toast({ title: "Errore Caricamento Feed", description: result.error, variant: "destructive" });
        setFetchedFeedItems([]);
      } else {
        setFetchedFeedItems(result.items);
        toast({ title: "Feed Caricato!", description: `Trovati ${result.items.length} articoli.` });
      }
    } catch (error) {
      console.error("Errore durante il recupero del feed:", error);
      toast({ title: "Errore Caricamento Feed", description: (error as Error).message || "Si è verificato un errore.", variant: "destructive" });
    } finally {
      setIsFetchingFeed(false);
    }
  };

  const handlePrepareForAI = (item: FeedItem) => {
    setOriginalPostTitle(item.title || "");
    setOriginalPostContent(item.content || "");
    // La categoria dovrà essere impostata manualmente o tramite un'altra logica
    setPostCategory(""); // Resetta la categoria
    toast({ title: "Articolo Pronto", description: "Titolo e contenuto caricati nel modulo di elaborazione AI."});
    // Potrebbe essere utile scrollare alla sezione di elaborazione AI
    document.getElementById('ai-processing-card')?.scrollIntoView({ behavior: 'smooth' });
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
                <Label htmlFor="feedUrlInput" className="text-muted-foreground">URL Feed RSS/Atom</Label>
                <div className="flex gap-2 mt-1">
                  <Input 
                    id="feedUrlInput" 
                    type="url" 
                    placeholder="https://esempio.com/feed.xml" 
                    className="flex-grow"
                    value={feedUrl}
                    onChange={(e) => setFeedUrl(e.target.value)}
                    disabled={isFetchingFeed}
                  />
                  <Button onClick={handleFetchFeed} disabled={isFetchingFeed}>
                    {isFetchingFeed ? <Loader2 className="animate-spin h-4 w-4" /> : "Carica"}
                  </Button> 
                </div>
              </div>
              {fetchedFeedItems.length > 0 && (
                <div className="mt-4 space-y-2 max-h-96 overflow-y-auto border p-2 rounded-md">
                  <h4 className="font-semibold text-sm mb-2">Articoli dal Feed:</h4>
                  {fetchedFeedItems.map((item, index) => (
                    <Card key={item.guid || index} className="p-2 text-sm bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div>
                            <p className="font-medium truncate" title={item.title}>{item.title || "Nessun Titolo"}</p>
                            {item.pubDate && <p className="text-xs text-muted-foreground">{new Date(item.pubDate).toLocaleDateString()}</p>}
                        </div>
                        <div className="flex gap-1">
                            {item.link && (
                                <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" title="Apri originale">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </Button>
                            )}
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => handlePrepareForAI(item)}
                                title="Prepara per AI"
                            >
                                <ListChecks className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
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

              <div className="space-y-1">
                <Label>Colore Primario Pulsanti (HSL)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="primaryHue" className="text-xs text-muted-foreground">H (0-360)</Label>
                    <Input id="primaryHue" type="number" min="0" max="360" value={localPrimaryHue} onChange={(e) => setLocalPrimaryHue(e.target.value)} placeholder="190" />
                  </div>
                  <div>
                    <Label htmlFor="primarySaturation" className="text-xs text-muted-foreground">S (0-100)</Label>
                    <Input id="primarySaturation" type="number" min="0" max="100" value={localPrimarySaturation} onChange={(e) => setLocalPrimarySaturation(e.target.value)} placeholder="28" />
                  </div>
                  <div>
                    <Label htmlFor="primaryLightness" className="text-xs text-muted-foreground">L (0-100)</Label>
                    <Input id="primaryLightness" type="number" min="0" max="100" value={localPrimaryLightness} onChange={(e) => setLocalPrimaryLightness(e.target.value)} placeholder="57" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Colore Testo Primario Pulsanti (HSL)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="primaryFgHue" className="text-xs text-muted-foreground">H (0-360)</Label>
                    <Input id="primaryFgHue" type="number" min="0" max="360" value={localPrimaryFgHue} onChange={(e) => setLocalPrimaryFgHue(e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <Label htmlFor="primaryFgSaturation" className="text-xs text-muted-foreground">S (0-100)</Label>
                    <Input id="primaryFgSaturation" type="number" min="0" max="100" value={localPrimaryFgSaturation} onChange={(e) => setLocalPrimaryFgSaturation(e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <Label htmlFor="primaryFgLightness" className="text-xs text-muted-foreground">L (0-100)</Label>
                    <Input id="primaryFgLightness" type="number" min="0" max="100" value={localPrimaryFgLightness} onChange={(e) => setLocalPrimaryFgLightness(e.target.value)} placeholder="100" />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveCustomizations} disabled={isSavingCustomizations} className="w-full mt-2">
                {isSavingCustomizations ? <Loader2 className="animate-spin mr-2" /> : <Edit3 className="mr-2 h-4 w-4" />}
                Salva Personalizzazioni
              </Button>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-6">
           <Card className="shadow-lg" id="ai-processing-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-6 w-6 text-primary" />
                Elaborazione Post con AI
              </CardTitle>
              <CardDescription>
                Carica un articolo da un feed o inserisci manualmente il testo, poi elaboralo con l'AI per ottimizzare titolo, contenuto, meta description e keywords SEO.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="originalPostTitle">Titolo Originale</Label>
                <Input 
                  id="originalPostTitle" 
                  value={originalPostTitle} 
                  onChange={(e) => setOriginalPostTitle(e.target.value)} 
                  placeholder="Es: Nuova auto elettrica in arrivo" 
                  disabled={isProcessingPost}
                />
              </div>
              <div>
                <Label htmlFor="postCategory">Categoria</Label>
                <Input 
                  id="postCategory" 
                  value={postCategory} 
                  onChange={(e) => setPostCategory(e.target.value)} 
                  placeholder="Es: Novità Auto, Guide, Recensioni" 
                  disabled={isProcessingPost}
                />
              </div>
              <div>
                <Label htmlFor="originalPostContent">Contenuto Originale (min 50 caratteri)</Label>
                <Textarea 
                  id="originalPostContent" 
                  value={originalPostContent} 
                  onChange={(e) => setOriginalPostContent(e.target.value)} 
                  rows={6} 
                  placeholder="Incolla qui il contenuto originale del post..." 
                  disabled={isProcessingPost}
                />
              </div>
              <Button onClick={handleProcessPost} disabled={isProcessingPost} className="w-full">
                {isProcessingPost ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Elabora Post con AI
              </Button>
              {processedPostData && (
                <div className="mt-6 space-y-4 border-t pt-4">
                  <div>
                    <Label className="font-semibold">Titolo Elaborato:</Label>
                    <p className="mt-1 p-2 border rounded-md bg-muted text-sm">{processedPostData.processedTitle}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Meta Description:</Label>
                    <p className="mt-1 p-2 border rounded-md bg-muted text-sm">{processedPostData.metaDescription}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Keywords SEO:</Label>
                    <p className="mt-1 p-2 border rounded-md bg-muted text-sm">{processedPostData.seoKeywords.join(', ')}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Contenuto Elaborato:</Label>
                    <Textarea 
                      readOnly 
                      value={processedPostData.processedContent} 
                      rows={10} 
                      className="mt-1 bg-muted text-sm"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
                {/* Pulsante Registrati non più mostrato */}
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
