
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
import { ArrowRight, MessageSquare, ThumbsUp, Shield, Loader2, Rss, Palette, Edit3, Sparkles, ListChecks, ExternalLink, FileEdit } from 'lucide-react';
import { useAuth } from "@/contexts/auth-context";
import { useSiteCustomization } from "@/contexts/site-customization-context"; 
import { processBlogPost, type ProcessBlogPostInput, type ProcessBlogPostOutput } from "@/ai/flows/process-blog-post";
import { syndicateAndProcessContent, type SyndicateAndProcessContentInput, type SyndicateAndProcessContentOutput, type ProcessedArticleData } from "@/ai/flows/syndicate-and-process-content";
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

  // State per l'elaborazione manuale AI
  const [originalPostTitle, setOriginalPostTitle] = useState("");
  const [originalPostContent, setOriginalPostContent] = useState("");
  const [postCategory, setPostCategory] = useState(""); // Categoria per l'elaborazione manuale
  const [isProcessingPostManual, setIsProcessingPostManual] = useState(false);
  const [processedPostDataManual, setProcessedPostDataManual] = useState<ProcessBlogPostOutput | null>(null);

  // State per l'importazione e l'elaborazione automatica da feed
  const [feedUrl, setFeedUrl] = useState("");
  const [defaultFeedCategory, setDefaultFeedCategory] = useState(""); // Categoria per gli articoli del feed
  const [isProcessingFeed, setIsProcessingFeed] = useState(false);
  const [processedFeedArticles, setProcessedFeedArticles] = useState<ProcessedArticleData[]>([]);
  const [feedProcessingErrors, setFeedProcessingErrors] = useState<{originalTitle?: string, error: string}[]>([]);


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

  const handleProcessPostManually = async () => {
    if (!originalPostTitle || !originalPostContent || !postCategory) {
      toast({ title: "Campi Mancanti", description: "Per favore, compila titolo, contenuto e categoria per l'elaborazione manuale.", variant: "destructive" });
      return;
    }
    setIsProcessingPostManual(true);
    setProcessedPostDataManual(null);
    try {
      const input: ProcessBlogPostInput = {
        originalTitle: originalPostTitle,
        originalContent: originalPostContent,
        category: postCategory,
      };
      const result = await processBlogPost(input);
      setProcessedPostDataManual(result);
      toast({ title: "Post Elaborato Manualmente!", description: "Il post è stato processato con successo dall'AI." });
    } catch (error) {
      console.error("Errore durante l'elaborazione manuale del post:", error);
      toast({ title: "Errore Elaborazione Manuale", description: (error as Error).message || "Si è verificato un errore.", variant: "destructive" });
    } finally {
      setIsProcessingPostManual(false);
    }
  };

  const handleSyndicateAndProcess = async () => {
    if (!feedUrl) {
      toast({ title: "URL Feed Mancante", description: "Per favore, inserisci un URL per il feed.", variant: "destructive" });
      return;
    }
    if (!defaultFeedCategory) {
      toast({ title: "Categoria Mancante", description: "Per favore, inserisci una categoria predefinita per gli articoli del feed.", variant: "destructive" });
      return;
    }
    setIsProcessingFeed(true);
    setProcessedFeedArticles([]);
    setFeedProcessingErrors([]);

    let effectiveFeedUrl = feedUrl.trim();
    if (effectiveFeedUrl && !effectiveFeedUrl.startsWith('http://') && !effectiveFeedUrl.startsWith('https://')) {
      effectiveFeedUrl = `https://${effectiveFeedUrl}`;
      setFeedUrl(effectiveFeedUrl); // Update state to reflect change in UI if needed, though not strictly necessary here
    }

    try {
      const input: SyndicateAndProcessContentInput = { feedUrl: effectiveFeedUrl, defaultCategory: defaultFeedCategory };
      const result: SyndicateAndProcessContentOutput = await syndicateAndProcessContent(input);
      
      setProcessedFeedArticles(result.processedArticles);
      if (result.errors && result.errors.length > 0) {
        setFeedProcessingErrors(result.errors);
        toast({ 
          title: "Feed Elaborato con Errori", 
          description: `Completato, ma ${result.errors.length} articoli hanno avuto problemi. Controlla i dettagli.`, 
          variant: "default" // Changed to default to be less alarming if some articles are still processed
        });
      } else if (result.processedArticles.length === 0) {
        toast({ title: "Nessun Articolo Elaborato", description: "Il feed potrebbe essere vuoto o gli articoli non idonei.", variant: "default" });
      }
       else {
        toast({ title: "Feed Elaborato!", description: `Processati ${result.processedArticles.length} articoli.` });
      }
    } catch (error) {
      console.error("Errore durante l'importazione e l'elaborazione del feed:", error);
      // The error message from Zod will be "L'URL del feed non è valido." if it's a Zod validation error.
      // Other errors will have their own messages.
      toast({ title: "Errore Elaborazione Feed", description: (error as Error).message || "Si è verificato un errore critico.", variant: "destructive" });
      setFeedProcessingErrors([{error: (error as Error).message || "Errore critico sconosciuto."}]);
    } finally {
      setIsProcessingFeed(false);
    }
  };

  const handleReviewAndEditProcessedArticle = (article: ProcessedArticleData) => {
    setOriginalPostTitle(article.originalTitleFromFeed || article.processedTitle); 
    setOriginalPostContent(article.processedContent);
    setPostCategory(defaultFeedCategory); 
    
    setProcessedPostDataManual({
      processedTitle: article.processedTitle,
      processedContent: article.processedContent,
      metaDescription: article.metaDescription,
      seoKeywords: article.seoKeywords,
    });

    toast({ title: "Articolo Caricato per Revisione", description: "I dati elaborati sono pronti nell'editor manuale."});
    document.getElementById('ai-manual-processing-card')?.scrollIntoView({ behavior: 'smooth' });
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
                Importa ed Elabora Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="feedUrlInput" className="text-muted-foreground">URL Feed RSS/Atom</Label>
                <Input 
                  id="feedUrlInput" 
                  type="url" 
                  placeholder="esempio.com/feed.xml" 
                  value={feedUrl}
                  onChange={(e) => setFeedUrl(e.target.value)}
                  disabled={isProcessingFeed}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="defaultFeedCategoryInput" className="text-muted-foreground">Categoria Predefinita per il Feed</Label>
                <Input 
                  id="defaultFeedCategoryInput" 
                  type="text" 
                  placeholder="Es: Novità Tecnologiche" 
                  value={defaultFeedCategory}
                  onChange={(e) => setDefaultFeedCategory(e.target.value)}
                  disabled={isProcessingFeed}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleSyndicateAndProcess} disabled={isProcessingFeed || !feedUrl || !defaultFeedCategory} className="w-full">
                {isProcessingFeed ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2"/>}
                Importa ed Elabora Feed
              </Button> 
              
              {feedProcessingErrors.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold text-sm text-destructive mb-1">Errori Durante Elaborazione Feed:</h4>
                  {feedProcessingErrors.map((err, index) => (
                    <Card key={`error-${index}`} className="p-2 text-xs bg-destructive/10 border-destructive/30">
                      {err.originalTitle && <p className="font-medium truncate" title={err.originalTitle}>Articolo: {err.originalTitle}</p>}
                      <p className="text-destructive">{err.error}</p>
                    </Card>
                  ))}
                </div>
              )}

              {processedFeedArticles.length > 0 && (
                <div className="mt-4 space-y-2 max-h-96 overflow-y-auto border p-2 rounded-md">
                  <h4 className="font-semibold text-sm mb-2">Articoli Elaborati dal Feed:</h4>
                  {processedFeedArticles.map((article, index) => (
                    <Card key={article.originalLink || index} className="p-2 text-sm bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div className="flex-grow overflow-hidden">
                            <p className="font-medium truncate text-xs text-muted-foreground" title={article.originalTitleFromFeed}>
                                Orig: {article.originalTitleFromFeed || "N/D"}
                            </p>
                            <p className="font-semibold truncate" title={article.processedTitle}>
                                Elaborato: {article.processedTitle || "Nessun Titolo"}
                            </p>
                        </div>
                        <div className="flex gap-1 shrink-0 ml-2">
                            {article.originalLink && (
                                <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                                    <a href={article.originalLink} target="_blank" rel="noopener noreferrer" title="Apri originale">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </Button>
                            )}
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => handleReviewAndEditProcessedArticle(article)}
                                title="Rivedi ed Edita Articolo Elaborato"
                            >
                                <FileEdit className="h-3.5 w-3.5" />
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
           <Card className="shadow-lg" id="ai-manual-processing-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-6 w-6 text-primary" />
                Editor & Elaborazione Manuale Post
              </CardTitle>
              <CardDescription>
                Rivedi un articolo elaborato automaticamente o inserisci manualmente il testo, poi elaboralo con l'AI per ottimizzare titolo, contenuto, meta description e keywords SEO.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="originalPostTitle">Titolo Articolo</Label>
                <Input 
                  id="originalPostTitle" 
                  value={originalPostTitle} 
                  onChange={(e) => setOriginalPostTitle(e.target.value)} 
                  placeholder="Es: Nuova auto elettrica in arrivo" 
                  disabled={isProcessingPostManual}
                />
              </div>
              <div>
                <Label htmlFor="postCategory">Categoria Articolo</Label>
                <Input 
                  id="postCategory" 
                  value={postCategory} 
                  onChange={(e) => setPostCategory(e.target.value)} 
                  placeholder="Es: Novità Auto, Guide, Recensioni" 
                  disabled={isProcessingPostManual}
                />
              </div>
              <div>
                <Label htmlFor="originalPostContent">Contenuto Articolo (min 50 caratteri)</Label>
                <Textarea 
                  id="originalPostContent" 
                  value={originalPostContent} 
                  onChange={(e) => setOriginalPostContent(e.target.value)} 
                  rows={6} 
                  placeholder="Incolla qui il contenuto originale o elaborato del post..." 
                  disabled={isProcessingPostManual}
                />
              </div>
              <Button onClick={handleProcessPostManually} disabled={isProcessingPostManual || !originalPostTitle || !originalPostContent || !postCategory} className="w-full">
                {isProcessingPostManual ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
                (Ri)Elabora Post con AI
              </Button>
              {processedPostDataManual && (
                <div className="mt-6 space-y-4 border-t pt-4">
                  <div>
                    <Label className="font-semibold">Titolo Elaborato:</Label>
                    <p className="mt-1 p-2 border rounded-md bg-muted text-sm">{processedPostDataManual.processedTitle}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Meta Description:</Label>
                    <p className="mt-1 p-2 border rounded-md bg-muted text-sm">{processedPostDataManual.metaDescription}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Keywords SEO:</Label>
                    <p className="mt-1 p-2 border rounded-md bg-muted text-sm">{processedPostDataManual.seoKeywords.join(', ')}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Contenuto Elaborato (dall'AI):</Label>
                    <Textarea 
                      readOnly 
                      value={processedPostDataManual.processedContent} 
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
              <CardTitle>Attività Recenti del Sito (Placeholder)</CardTitle>
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


    