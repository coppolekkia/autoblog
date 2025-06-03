
// src/components/admin/admin-news-site-view.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, MessageSquare, ThumbsUp, Loader2, Rss, Palette, Edit3, Sparkles, ListChecks, ExternalLink, FileEdit, Rocket, PlusCircle, Megaphone, CheckSquare, CircleOff } from 'lucide-react';
import { useAuth } from "@/contexts/auth-context";
import { useSiteCustomization } from "@/contexts/site-customization-context";
import { usePosts } from "@/contexts/posts-context";
import { processBlogPost, type ProcessBlogPostInput, type ProcessBlogPostOutput } from "@/ai/flows/process-blog-post";
import { syndicateAndProcessContent, type SyndicateAndProcessContentInput, type SyndicateAndProcessContentOutput, type ProcessedArticleData as FeedProcessedArticleData } from "@/ai/flows/syndicate-and-process-content";
import { scrapeUrlAndProcessContent, type ScrapeUrlAndProcessContentInput, type ScrapedAndProcessedArticleData } from "@/ai/flows/scrapeUrlAndProcessContent";

import { useToast } from "@/hooks/use-toast";
import type { Post } from '@/types/blog';
import { db, auth as firebaseAuth } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Banner {
  id: string;
  name: string;
  contentHTML: string;
  placement: 'underTitle' | 'afterContent' | 'popup';
  isActive: boolean;
  createdAt: Timestamp;
}

interface AdminNewsSiteViewProps {
  adminUid: string; // Pass ADMIN_UID_FOR_RULES as a prop
}

type BatchScrapeResultItem = ScrapedAndProcessedArticleData & { status: 'success' | 'error', originalUrl: string, message?: string };


export function AdminNewsSiteView({ adminUid }: AdminNewsSiteViewProps) {
  const { currentUser } = useAuth();
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
  const { addPost } = usePosts();
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
  const [originalPostImageUrl, setOriginalPostImageUrl] = useState("");
  const [originalPostImageHint, setOriginalPostImageHint] = useState("");
  const [postCategory, setPostCategory] = useState("Generale");
  const [isProcessingPostManual, setIsProcessingPostManual] = useState(false);
  const [processedPostDataManual, setProcessedPostDataManual] = useState<ProcessBlogPostOutput | null>(null);

  const [feedUrl, setFeedUrl] = useState("");
  const [defaultFeedCategory, setDefaultFeedCategory] = useState("Feed");
  const [isProcessingFeed, setIsProcessingFeed] = useState(false);
  const [processedFeedArticles, setProcessedFeedArticles] = useState<FeedProcessedArticleData[]>([]);
  const [feedProcessingErrors, setFeedProcessingErrors] = useState<{ originalTitle?: string, error: string }[]>([]);

  const [scrapeUrlsInput, setScrapeUrlsInput] = useState("");
  const [scrapeCategory, setScrapeCategory] = useState("Scraping");
  const [isProcessingBatchScrape, setIsProcessingBatchScrape] = useState(false);
  const [batchScrapeResults, setBatchScrapeResults] = useState<BatchScrapeResultItem[]>([]);


  const [bannerName, setBannerName] = useState("");
  const [bannerContentHTML, setBannerContentHTML] = useState("");
  const [bannerPlacement, setBannerPlacement] = useState<'underTitle' | 'afterContent' | 'popup'>('underTitle');
  const [bannerIsActive, setBannerIsActive] = useState(true);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [bannersList, setBannersList] = useState<Banner[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(false);


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

  const fetchBanners = async () => {
    setIsLoadingBanners(true);
    try {
      const bannersCollection = collection(db, "banners");
      const q = query(bannersCollection, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedBanners: Banner[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedBanners.push({
          id: doc.id,
          name: data.name,
          contentHTML: data.contentHTML,
          placement: data.placement,
          isActive: data.isActive,
          createdAt: data.createdAt,
        } as Banner);
      });
      setBannersList(fetchedBanners);
    } catch (error) {
      console.error("Errore nel recupero dei banner:", error);
      toast({ title: "Errore Caricamento Banner", description: "Impossibile caricare i banner. Controlla i permessi di Firestore.", variant: "destructive" });
    } finally {
      setIsLoadingBanners(false);
    }
  };


  useEffect(() => {
    fetchBanners();
  }, []);


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

  const handlePublishPost = () => {
    if (!processedPostDataManual) {
      toast({ title: "Nessun Dato da Pubblicare", description: "Elabora prima un post con l'AI.", variant: "destructive" });
      return;
    }
    if (!postCategory) {
      toast({ title: "Categoria Mancante", description: "Assicurati che una categoria sia specificata per il post.", variant: "destructive" });
      return;
    }

    addPost({
      title: processedPostDataManual.processedTitle,
      content: processedPostDataManual.processedContent,
      excerpt: processedPostDataManual.metaDescription,
      category: postCategory,
      imageUrl: originalPostImageUrl || undefined,
      imageHint: originalPostImageHint || processedPostDataManual.processedTitle.split(" ").slice(0,2).join(" ") || "blog image",
    });

    toast({ title: "Post Pubblicato!", description: `"${processedPostDataManual.processedTitle}" è stato aggiunto al blog.` });

    setOriginalPostTitle("");
    setOriginalPostContent("");
    setOriginalPostImageUrl("");
    setOriginalPostImageHint("");
    setPostCategory("Generale");
    setProcessedPostDataManual(null);
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
      setFeedUrl(effectiveFeedUrl);
    }

    try {
      const input: SyndicateAndProcessContentInput = { feedUrl: effectiveFeedUrl, defaultCategory: defaultFeedCategory };
      const result: SyndicateAndProcessContentOutput = await syndicateAndProcessContent(input);

      setProcessedFeedArticles(result.processedArticles);
      if (result.errors && result.errors.length > 0) {
        setFeedProcessingErrors(result.errors);
        toast({
          title: "Feed Elaborato con Errori/Note",
          description: `Completato, ma ${result.errors.length} messaggi presenti. Controlla i dettagli.`,
          variant: "default"
        });
      } else if (result.processedArticles.length === 0) {
        toast({ title: "Nessun Articolo Elaborato", description: "Il feed potrebbe essere vuoto o gli articoli non idonei.", variant: "default" });
      }
      else {
        toast({ title: "Feed Elaborato!", description: `Processati ${result.processedArticles.length} articoli.` });
      }
    } catch (error) {
      console.error("Errore durante l'importazione e l'elaborazione del feed:", error);
      toast({ title: "Errore Elaborazione Feed", description: (error as Error).message || "Si è verificato un errore critico.", variant: "destructive" });
      setFeedProcessingErrors([{ error: (error as Error).message || "Errore critico sconosciuto." }]);
    } finally {
      setIsProcessingFeed(false);
    }
  };

  const handleReviewAndEditProcessedArticle = (
    article: FeedProcessedArticleData | ScrapedAndProcessedArticleData,
    categoryToUse: string
  ) => {
    let titleForEditor = article.processedTitle;
    let imageUrlForEditor = "";
    let imageHintForEditor = "";

    if ('originalTitleFromFeed' in article) { // Type guard for FeedProcessedArticleData
      titleForEditor = article.originalTitleFromFeed || article.processedTitle;
    } else if ('extractedImageUrl' in article && article.extractedImageUrl) { // Type guard for ScrapedAndProcessedArticleData
      imageUrlForEditor = article.extractedImageUrl;
      imageHintForEditor = article.processedTitle.split(' ').slice(0, 2).join(' ') || "immagine articolo";
    }


    setOriginalPostTitle(titleForEditor);
    setOriginalPostContent(article.processedContent);
    setOriginalPostImageUrl(imageUrlForEditor);
    setOriginalPostImageHint(imageHintForEditor);
    setPostCategory(categoryToUse);

    setProcessedPostDataManual({
      processedTitle: article.processedTitle,
      processedContent: article.processedContent,
      metaDescription: article.metaDescription,
      seoKeywords: article.seoKeywords,
    });

    toast({ title: "Articolo Caricato per Revisione", description: "I dati elaborati sono pronti nell'editor manuale." });
    document.getElementById('ai-manual-processing-card')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBatchScrapeAndProcess = async () => {
    console.log('[AdminNewsSiteView] handleBatchScrapeAndProcess invoked.');
    const urls = scrapeUrlsInput.trim().split('\n').map(url => url.trim()).filter(url => url);
    if (urls.length === 0) {
      toast({ title: "Nessun URL Inserito", description: "Per favore, inserisci uno o più URL nella textarea.", variant: "destructive" });
      return;
    }
    if (!scrapeCategory) {
      toast({ title: "Categoria Mancante", description: "Per favore, inserisci una categoria per gli articoli da estrarre.", variant: "destructive" });
      return;
    }

    console.log(`[AdminNewsSiteView] Starting batch scrape for ${urls.length} URLs in category: ${scrapeCategory}. URLs:`, urls);
    setIsProcessingBatchScrape(true);
    setBatchScrapeResults([]);
    let currentResults: BatchScrapeResultItem[] = [];

    for (const url of urls) {
      let effectiveScrapeUrl = url;
      if (!effectiveScrapeUrl.startsWith('http://') && !effectiveScrapeUrl.startsWith('https://')) {
        effectiveScrapeUrl = `https://${effectiveScrapeUrl}`;
      }
      console.log(`[AdminNewsSiteView] Processing URL: ${effectiveScrapeUrl}`);
      try {
        toast({ title: `Inizio Elaborazione URL: ${url}`, description: "Estrazione e analisi AI in corso..." });
        const input: ScrapeUrlAndProcessContentInput = { url: effectiveScrapeUrl, category: scrapeCategory };
        const scrapedData = await scrapeUrlAndProcessContent(input);
        console.log(`[AdminNewsSiteView] Scraped data for ${url}:`, scrapedData);

        if (scrapedData.error && (!scrapedData.processedContent || scrapedData.processedContent.length < 50)) {
          currentResults = [...currentResults, { ...scrapedData, status: 'error', originalUrl: url, message: scrapedData.error }];
          setBatchScrapeResults(currentResults); // Update state iteratively
          toast({ title: `Errore URL: ${url}`, description: scrapedData.error, variant: "destructive" });
          console.warn(`[AdminNewsSiteView] Error scraping ${url}: ${scrapedData.error}`);
          continue;
        }
        
        // NON PUBBLICARE AUTOMATICAMENTE QUI
        // Invece, aggiungi ai risultati per la revisione
        currentResults = [...currentResults, { ...scrapedData, status: 'success', originalUrl: url, message: 'Elaborato. Pronto per revisione.' }];
        setBatchScrapeResults(currentResults); // Update state iteratively
        toast({ title: `Successo Elaborazione URL: ${url}`, description: `"${scrapedData.processedTitle}" elaborato. Rivedi e pubblica manualmente.` });
        console.log(`[AdminNewsSiteView] Successfully processed ${url}. Ready for review.`);

      } catch (error: any) {
        console.error(`[AdminNewsSiteView] Critical error processing ${url}:`, error);
        const errorResult: BatchScrapeResultItem = { 
            processedTitle: "Errore Elaborazione", 
            processedContent: "N/D", 
            metaDescription: "N/D", 
            seoKeywords: [], 
            originalUrlScraped: url,
            extractedImageUrl: undefined,
            status: 'error', 
            originalUrl: url, 
            message: error.message || "Errore sconosciuto durante l'elaborazione batch.",
            error: error.message || "Errore sconosciuto"
        };
        currentResults = [...currentResults, errorResult];
        setBatchScrapeResults(currentResults); // Update state iteratively
        toast({ title: `Errore Critico URL: ${url}`, description: error.message || "Errore sconosciuto.", variant: "destructive" });
      }
    }
    setIsProcessingBatchScrape(false);
    console.log('[AdminNewsSiteView] Batch scrape process finished.');
  };


  const handleAddBanner = async () => {
    if (!bannerName.trim() || !bannerContentHTML.trim()) {
      toast({ title: "Campi Banner Mancanti", description: "Nome e Contenuto HTML sono richiesti.", variant: "destructive" });
      return;
    }
    setIsAddingBanner(true);
    const clientUser = firebaseAuth.currentUser;
    console.log('[AdminPanel] Attempting to add banner. Current user UID for rules check:', clientUser?.uid);


    try {
      await addDoc(collection(db, "banners"), {
        name: bannerName.trim(),
        contentHTML: bannerContentHTML,
        placement: bannerPlacement,
        isActive: bannerIsActive,
        createdAt: serverTimestamp(),
        // Assicurati che le regole di sicurezza permettano la scrittura solo all'admin
        // request.auth.uid == "IL_TUO_ADMIN_UID_QUI"
      });
      toast({ title: "Banner Aggiunto!", description: `Il banner "${bannerName.trim()}" è stato salvato.` });
      setBannerName("");
      setBannerContentHTML("");
      fetchBanners(); 
    } catch (error: any) {
      const detectedUID = clientUser?.uid || 'UID_NON_DISPONIBILE';
      toast({
        title: "Errore Aggiunta Banner",
        description: `(${error.code || 'Unknown Error'}) ${error.message}. L'UID rilevato è: '${detectedUID}'. Assicurati che questo UID (${adminUid}) sia autorizzato nelle regole di sicurezza di Firestore per la collezione 'banners'.`,
        variant: "destructive",
        duration: 9000,
      });
    } finally {
      setIsAddingBanner(false);
    }
  };
  

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <PageHeader
        title="Pannello Admin & News del Sito"
        description="Benvenuto, Admin! Ecco le ultime attività e gli strumenti di gestione."
      />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">

        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {isProcessingFeed ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Importa ed Elabora Feed
                </Button>

                {feedProcessingErrors.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold text-sm text-destructive mb-1">Errori/Note Elaborazione Feed:</h4>
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
                              onClick={() => handleReviewAndEditProcessedArticle(article, defaultFeedCategory)}
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
                  <Rocket className="h-6 w-6 text-primary" />
                  Estrai da URL (Batch) & Elabora
                </CardTitle>
                <CardDescription>
                  Gli articoli estratti ed elaborati appariranno qui sotto. Clicca "Rivedi ed Edita" per caricarli nell'editor manuale e poi pubblicarli.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="scrapeUrlsInput" className="text-muted-foreground">URLs da Analizzare (uno per riga)</Label>
                  <Textarea
                    id="scrapeUrlsInput"
                    placeholder="https://esempio.com/articolo1\nhttps://esempio.com/articolo2"
                    value={scrapeUrlsInput}
                    onChange={(e) => setScrapeUrlsInput(e.target.value)}
                    disabled={isProcessingBatchScrape}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="scrapeCategoryInput" className="text-muted-foreground">Categoria per gli Articoli Estratti</Label>
                  <Input
                    id="scrapeCategoryInput"
                    type="text"
                    placeholder="Es: Recensioni Auto"
                    value={scrapeCategory}
                    onChange={(e) => setScrapeCategory(e.target.value)}
                    disabled={isProcessingBatchScrape}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleBatchScrapeAndProcess} disabled={isProcessingBatchScrape || !scrapeUrlsInput.trim() || !scrapeCategory} className="w-full">
                  {isProcessingBatchScrape ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Estrai ed Elabora URL in Batch
                </Button>
                {batchScrapeResults.length > 0 && (
                  <div className="mt-6 space-y-3 border-t pt-4 max-h-96 overflow-y-auto">
                    <h4 className="font-semibold text-sm mb-2">Risultati Elaborazione Batch URL:</h4>
                    {batchScrapeResults.map((result, index) => (
                      <Card key={`${result.originalUrl}-${index}`} className={`p-3 text-sm ${result.status === 'success' ? 'bg-muted/30' : 'bg-destructive/10 border-destructive/30'}`}>
                         <div className="flex justify-between items-start mb-1">
                            <p className="text-xs text-muted-foreground truncate font-mono flex-grow" title={result.originalUrl}>
                                URL: {result.originalUrl.length > 40 ? result.originalUrl.substring(0, 40) + "..." : result.originalUrl}
                            </p>
                             {result.status === 'success' && result.extractedImageUrl && (
                                <Image
                                  src={result.extractedImageUrl}
                                  alt={result.processedTitle || "Immagine articolo"}
                                  width={40}
                                  height={22} // approx 16:9 for 40px width
                                  className="rounded object-cover aspect-video ml-2 shrink-0"
                                  data-ai-hint={result.processedTitle.split(" ").slice(0,2).join(" ") || "scraped image"}
                                />
                              )}
                            {result.status === 'success' && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 shrink-0 ml-2"
                                    onClick={() => handleReviewAndEditProcessedArticle(result, scrapeCategory)}
                                    title="Rivedi ed Edita Articolo Estratto"
                                    >
                                    <FileEdit className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                        <p className="font-semibold truncate" title={result.processedTitle}>
                            {result.processedTitle || "N/D"}
                        </p>
                        <p className={`text-xs mt-1 ${result.status === 'success' ? 'text-green-600' : 'text-destructive'}`}>
                            {result.message || (result.status === 'error' ? result.error : 'Pronto per revisione')}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg" id="ai-manual-processing-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-6 w-6 text-primary" />
                Editor & Elaborazione Manuale Post
              </CardTitle>
              <CardDescription>
                Rivedi un articolo elaborato automaticamente o inserisci manualmente il testo, poi elaboralo con l'AI per ottimizzare titolo, contenuto, meta description e keywords SEO. Infine, pubblica il post.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="originalPostTitle">Titolo Articolo (Originale o per Revisione)</Label>
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
                <Label htmlFor="originalPostImageUrl">URL Immagine (Opzionale)</Label>
                <Input
                  id="originalPostImageUrl"
                  type="url"
                  value={originalPostImageUrl}
                  onChange={(e) => setOriginalPostImageUrl(e.target.value)}
                  placeholder="https://esempio.com/immagine.jpg"
                  disabled={isProcessingPostManual}
                />
              </div>
              <div>
                <Label htmlFor="originalPostImageHint">Suggerimento Immagine (per AI, opzionale)</Label>
                <Input
                  id="originalPostImageHint"
                  value={originalPostImageHint}
                  onChange={(e) => setOriginalPostImageHint(e.target.value)}
                  placeholder="Es: auto sportiva rossa"
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
                  <Button onClick={handlePublishPost} disabled={!processedPostDataManual || !postCategory} className="w-full mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Pubblica Post sul Blog
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-1 space-y-6">
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

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Megaphone className="h-6 w-6 text-primary" />
                Gestione Banner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 p-4 border rounded-md">
                <h3 className="text-lg font-medium">Aggiungi Nuovo Banner</h3>
                <div>
                  <Label htmlFor="bannerName">Nome Banner (Identificativo)</Label>
                  <Input
                    id="bannerName"
                    value={bannerName}
                    onChange={(e) => setBannerName(e.target.value)}
                    placeholder="Es. Banner Homepage Sotto Titolo"
                    disabled={isAddingBanner}
                  />
                </div>
                <div>
                  <Label htmlFor="bannerContentHTML">Contenuto Banner (HTML)</Label>
                  <Textarea
                    id="bannerContentHTML"
                    value={bannerContentHTML}
                    onChange={(e) => setBannerContentHTML(e.target.value)}
                    placeholder="<p>Testo banner</p> o <img src='...' />"
                    rows={4}
                    disabled={isAddingBanner}
                  />
                </div>
                <div>
                  <Label htmlFor="bannerPlacement">Posizionamento</Label>
                  <Select
                    value={bannerPlacement}
                    onValueChange={(value) => setBannerPlacement(value as 'underTitle' | 'afterContent' | 'popup')}
                    disabled={isAddingBanner}
                  >
                    <SelectTrigger id="bannerPlacement">
                      <SelectValue placeholder="Seleziona posizionamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="underTitle">Sotto Titolo Articolo</SelectItem>
                      <SelectItem value="afterContent">Dopo Contenuto Articolo</SelectItem>
                      <SelectItem value="popup">Popup Articolo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bannerIsActive"
                    checked={bannerIsActive}
                    onCheckedChange={(checked) => setBannerIsActive(!!checked)}
                    disabled={isAddingBanner}
                  />
                  <Label htmlFor="bannerIsActive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Attivo
                  </Label>
                </div>
                <Button onClick={handleAddBanner} disabled={isAddingBanner || !bannerName || !bannerContentHTML}>
                  {isAddingBanner ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  Aggiungi Banner
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Banner Esistenti</h3>
                {isLoadingBanners ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="animate-spin h-6 w-6 text-primary" />
                    <span className="ml-2">Caricamento banner...</span>
                  </div>
                ) : bannersList.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto border p-2 rounded-md">
                    {bannersList.map(b => (
                      <Card key={b.id} className="p-3 text-sm bg-muted/50">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{b.name}</p>
                                <p className="text-xs text-muted-foreground">
                                Pos: {b.placement === 'underTitle' ? 'Sotto Titolo' : b.placement === 'afterContent' ? 'Dopo Contenuto' : 'Popup'}
                                </p>
                            </div>
                            {b.isActive ? <CheckSquare className="h-5 w-5 text-green-600" /> : <CircleOff className="h-5 w-5 text-red-600" />}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">Nessun banner creato.</p>
                )}
                <Button onClick={fetchBanners} variant="outline" size="sm" className="mt-3 w-full">
                    {isLoadingBanners ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                    Aggiorna Lista Banner
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    

    