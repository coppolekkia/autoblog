
// src/app/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, MessageSquare, ThumbsUp, Shield, Loader2, Rss, Palette, Edit3, Sparkles, ListChecks, ExternalLink, FileEdit, Rocket, Send, ImageIcon, Users, MailCheck, PlusCircle, Newspaper } from 'lucide-react';
import { useAuth } from "@/contexts/auth-context";
import { useSiteCustomization } from "@/contexts/site-customization-context"; 
import { usePosts } from "@/contexts/posts-context"; 
import { processBlogPost, type ProcessBlogPostInput, type ProcessBlogPostOutput } from "@/ai/flows/process-blog-post";
import { syndicateAndProcessContent, type SyndicateAndProcessContentInput, type SyndicateAndProcessContentOutput, type ProcessedArticleData as FeedProcessedArticleData } from "@/ai/flows/syndicate-and-process-content";
import { scrapeUrlAndProcessContent, type ScrapeUrlAndProcessContentInput, type ScrapedAndProcessedArticleData } from "@/ai/flows/scrapeUrlAndProcessContent";
import { generateNewsletterContent, type GenerateNewsletterInput, type GenerateNewsletterOutput } from "@/ai/flows/generate-newsletter-content";
import { useToast } from "@/hooks/use-toast";
import type { Post } from '@/types/blog'; 
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp, addDoc, serverTimestamp } from 'firebase/firestore';

const ADMIN_EMAIL = "coppolek@gmail.com"; 

interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string; 
}

function BlogFeedView() {
  const { posts } = usePosts(); 

  if (!posts || posts.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <PageHeader
          title="Feed Principale"
          description="Nessun articolo da mostrare al momento."
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <PageHeader
        title="Feed Principale"
        description="Esplora gli ultimi articoli e discussioni."
      />
      <section className="max-w-4xl mx-auto space-y-8">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card flex flex-col">
            {post.imageUrl && (
              <Link href={`/blog/${post.slug}`} aria-label={`Leggi di più su ${post.title}`} className="block overflow-hidden">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  width={800} 
                  height={450} 
                  className="w-full h-auto object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                  data-ai-hint={post.imageHint || "blog image"}
                />
              </Link>
            )}
            <div className="p-6 flex-grow flex flex-col">
              <div className="flex items-center text-xs text-muted-foreground mb-3">
                {post.category && (
                  <Badge variant="secondary" className="mr-2"> 
                    <Link href={`/category/${post.category.toLowerCase()}`} className="hover:underline">
                      {post.category}
                    </Link>
                  </Badge>
                )}
                <span>Pubblicato da </span>
                <Link href={`/user/${post.author.toLowerCase().replace(' ','-')}`} className="font-medium hover:underline ml-1 mr-1">
                  {post.author}
                </Link>
                <span>• {post.date}</span>
              </div>

              <CardTitle className="text-2xl font-semibold mb-3">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                  {post.title}
                </Link>
              </CardTitle>
              
              <p className="text-base text-foreground/80 mb-6 line-clamp-4 flex-grow">{post.excerpt}</p>

              <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-border/50">
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary px-2">
                    <ThumbsUp className="mr-1.5 h-4 w-4" />
                    <span>{post.upvotes}</span>
                  </Button>
                   <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                     <Link href={`/blog/${post.slug}#comments`}>
                      <span className="inline-flex items-center">
                        <MessageSquare className="mr-1.5 h-4 w-4" />
                        <span>{post.commentsCount} Commenti</span>
                      </span>
                    </Link>
                  </Button>
                </div>
                <Button asChild variant="default" size="sm">
                  <Link href={`/blog/${post.slug}`}>
                     <span className="inline-flex items-center">
                        Leggi di più
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
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

  // State for AI manual processing / editor
  const [originalPostTitle, setOriginalPostTitle] = useState("");
  const [originalPostContent, setOriginalPostContent] = useState("");
  const [originalPostImageUrl, setOriginalPostImageUrl] = useState("");
  const [originalPostImageHint, setOriginalPostImageHint] = useState("");
  const [postCategory, setPostCategory] = useState("Generale"); 
  const [isProcessingPostManual, setIsProcessingPostManual] = useState(false);
  const [processedPostDataManual, setProcessedPostDataManual] = useState<ProcessBlogPostOutput | null>(null);

  // State for feed import
  const [feedUrl, setFeedUrl] = useState("");
  const [defaultFeedCategory, setDefaultFeedCategory] = useState("Feed"); 
  const [isProcessingFeed, setIsProcessingFeed] = useState(false);
  const [processedFeedArticles, setProcessedFeedArticles] = useState<FeedProcessedArticleData[]>([]);
  const [feedProcessingErrors, setFeedProcessingErrors] = useState<{originalTitle?: string, error: string}[]>([]);

  // State for URL scraping
  const [scrapeUrlInput, setScrapeUrlInput] = useState(""); 
  const [scrapeCategory, setScrapeCategory] = useState("Scraping");
  const [isScrapingAndProcessing, setIsScrapingAndProcessing] = useState(false);
  const [scrapedAndProcessedData, setScrapedAndProcessedData] = useState<ScrapedAndProcessedArticleData | null>(null);

  // State for Newsletter Subscribers
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false);
  const [newSubscriberEmail, setNewSubscriberEmail] = useState("");
  const [isAddingSubscriber, setIsAddingSubscriber] = useState(false);

  // State for Newsletter Generation
  const [newsletterAdminPrompt, setNewsletterAdminPrompt] = useState("");
  const [generatedNewsletterSubject, setGeneratedNewsletterSubject] = useState<string | null>(null);
  const [generatedNewsletterBody, setGeneratedNewsletterBody] = useState<string | null>(null);
  const [isGeneratingNewsletter, setIsGeneratingNewsletter] = useState(false);
  const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);


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

  const fetchNewsletterSubscribers = async () => {
    setIsLoadingSubscribers(true);
    try {
      const subscribersCollection = collection(db, "newsletterSubscriptions");
      const q = query(subscribersCollection, orderBy("subscribedAt", "desc"));
      const querySnapshot = await getDocs(q);
      const subscribers: NewsletterSubscriber[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        subscribers.push({
          id: doc.id,
          email: data.email,
          subscribedAt: data.subscribedAt instanceof Timestamp ? data.subscribedAt.toDate().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : "Data non disponibile",
        });
      });
      setNewsletterSubscribers(subscribers);
    } catch (error) {
      console.error("Errore nel recupero degli iscritti alla newsletter:", error);
      toast({ title: "Errore Iscritti", description: "Impossibile caricare gli iscritti.", variant: "destructive" });
    } finally {
      setIsLoadingSubscribers(false);
    }
  };

  useEffect(() => {
    fetchNewsletterSubscribers(); 
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
      imageHint: originalPostImageHint || undefined, 
    });

    toast({ title: "Post Pubblicato!", description: `"${processedPostDataManual.processedTitle}" è stato aggiunto al blog.` });
    
    setOriginalPostTitle("");
    setOriginalPostContent("");
    setOriginalPostImageUrl("");
    setOriginalPostImageHint("");
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
      setFeedProcessingErrors([{error: (error as Error).message || "Errore critico sconosciuto."}]);
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
    
    if ('originalTitleFromFeed' in article) { 
        titleForEditor = article.originalTitleFromFeed || article.processedTitle;
    } else if ('extractedImageUrl' in article && article.extractedImageUrl) { 
        imageUrlForEditor = article.extractedImageUrl;
        imageHintForEditor = article.processedTitle.split(' ').slice(0,2).join(' ') || "immagine articolo";
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

    toast({ title: "Articolo Caricato per Revisione", description: "I dati elaborati sono pronti nell'editor manuale."});
    document.getElementById('ai-manual-processing-card')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrapeAndProcess = async () => {
    if (!scrapeUrlInput) {
      toast({ title: "URL Mancante", description: "Per favore, inserisci un URL da analizzare.", variant: "destructive" });
      return;
    }
    if (!scrapeCategory) {
      toast({ title: "Categoria Mancante", description: "Per favore, inserisci una categoria per l'articolo da estrarre.", variant: "destructive" });
      return;
    }
    setIsScrapingAndProcessing(true);
    setScrapedAndProcessedData(null);

    let effectiveScrapeUrl = scrapeUrlInput.trim();
    if (effectiveScrapeUrl && !effectiveScrapeUrl.startsWith('http://') && !effectiveScrapeUrl.startsWith('https://')) {
        effectiveScrapeUrl = `https://${effectiveScrapeUrl}`;
        setScrapeUrlInput(effectiveScrapeUrl);
    }

    try {
      const input: ScrapeUrlAndProcessContentInput = { url: effectiveScrapeUrl, category: scrapeCategory };
      const result = await scrapeUrlAndProcessContent(input);
      
      if (result.error && (!result.processedContent || result.processedContent.length < 50)) { 
        toast({ title: "Errore Estrazione/Elaborazione URL", description: result.error, variant: "destructive" });
        setScrapedAndProcessedData({
            processedTitle: result.processedTitle || "Titolo non Estratto",
            processedContent: result.processedContent || "Contenuto non Estratto",
            metaDescription: result.metaDescription || "",
            seoKeywords: result.seoKeywords || [],
            originalUrlScraped: result.originalUrlScraped,
            extractedImageUrl: result.extractedImageUrl,
            error: result.error
        });
      } else {
        setScrapedAndProcessedData(result); 
        if (result.error) {
             toast({ title: "Elaborazione URL con Avviso", description: `Contenuto parzialmente estratto o elaborato con errori. Dettagli: ${result.error}`, variant: "default" });
        } else {
            toast({ title: "Contenuto Estratto ed Elaborato!", description: "Il contenuto dell'URL è stato processato con successo." });
        }
      }
    } catch (error) {
      console.error("Errore durante lo scraping e l'elaborazione dell'URL:", error);
      toast({ title: "Errore Critico Estrazione URL", description: (error as Error).message || "Si è verificato un errore sconosciuto.", variant: "destructive" });
    } finally {
      setIsScrapingAndProcessing(false);
    }
  };

  const handleAddSubscriber = async () => {
    if (!newSubscriberEmail.trim()) {
      toast({ title: "Email Mancante", description: "Inserisci un indirizzo email da aggiungere.", variant: "destructive"});
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newSubscriberEmail.trim())) {
      toast({ title: "Email Non Valida", description: "Inserisci un indirizzo email valido.", variant: "destructive"});
      return;
    }

    setIsAddingSubscriber(true);
    try {
      await addDoc(collection(db, "newsletterSubscriptions"), {
        email: newSubscriberEmail.trim(),
        subscribedAt: serverTimestamp(),
      });
      toast({ title: "Iscritto Aggiunto!", description: `${newSubscriberEmail.trim()} è stato aggiunto alla newsletter.`});
      setNewSubscriberEmail(""); 
      fetchNewsletterSubscribers(); 
    } catch (error) {
      console.error("Errore aggiunta iscritto:", error);
      toast({ title: "Errore Aggiunta", description: "Impossibile aggiungere l'iscritto.", variant: "destructive"});
    } finally {
      setIsAddingSubscriber(false);
    }
  };

  const handleGenerateNewsletter = async () => {
    if (!newsletterAdminPrompt.trim()) {
      toast({ title: "Prompt Mancante", description: "Per favore, inserisci un prompt per generare la newsletter.", variant: "destructive" });
      return;
    }
    setIsGeneratingNewsletter(true);
    setGeneratedNewsletterSubject(null);
    setGeneratedNewsletterBody(null);
    try {
      const input: GenerateNewsletterInput = {
        adminPrompt: newsletterAdminPrompt,
        siteTitle: currentGlobalTitle, 
      };
      const result: GenerateNewsletterOutput = await generateNewsletterContent(input);
      setGeneratedNewsletterSubject(result.subject);
      setGeneratedNewsletterBody(result.body);
      toast({ title: "Newsletter Generata!", description: "Il contenuto della newsletter è pronto." });
    } catch (error) {
      console.error("Errore durante la generazione della newsletter:", error);
      toast({ title: "Errore Generazione Newsletter", description: (error as Error).message || "Si è verificato un errore.", variant: "destructive" });
    } finally {
      setIsGeneratingNewsletter(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!generatedNewsletterSubject || !generatedNewsletterBody) {
      toast({ title: "Contenuto Newsletter Mancante", description: "Genera prima il contenuto della newsletter.", variant: "destructive" });
      return;
    }
    setIsSendingNewsletter(true);
    try {
      const subscribersCollection = collection(db, "newsletterSubscriptions");
      const q = query(subscribersCollection); // No ordering needed, just get all
      const querySnapshot = await getDocs(q);
      const subscriberEmails: string[] = [];
      querySnapshot.forEach((doc) => {
        subscriberEmails.push(doc.data().email);
      });

      if (subscriberEmails.length > 0) {
        console.log("--- INIZIO SIMULAZIONE INVIO NEWSLETTER ---");
        console.log("Oggetto:", generatedNewsletterSubject);
        console.log("Corpo (primi 200 caratteri):", generatedNewsletterBody.substring(0, 200) + "...");
        console.log(`La newsletter SAREBBE STATA INVIATA a ${subscriberEmails.length} iscritti:`);
        subscriberEmails.forEach(email => console.log(`- ${email}`));
        console.log("--- FINE SIMULAZIONE INVIO NEWSLETTER ---");
        toast({
          title: "Invio Newsletter (Simulato)",
          description: `La newsletter è stata 'inviata' a ${subscriberEmails.length} iscritti. Controlla la console per i dettagli.`,
        });
      } else {
        toast({
          title: "Nessun Iscritto",
          description: "Non ci sono iscritti alla newsletter a cui inviare.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Errore durante il recupero degli iscritti per l'invio simulato:", error);
      toast({ title: "Errore Invio Simulata", description: "Impossibile recuperare gli iscritti.", variant: "destructive" });
    } finally {
      setIsSendingNewsletter(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <PageHeader
        title="Pannello Admin & News del Sito"
        description="Benvenuto, Admin! Ecco le ultime attività e gli strumenti di gestione."
      />
      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Colonna Sinistra/Principale per i tools di contenuto */}
        <div className="lg:col-span-2 space-y-6 order-1">
          <div className="grid md:grid-cols-2 gap-6">
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
                  Estrai da URL & Elabora
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="scrapeUrlInput" className="text-muted-foreground">URL da Analizzare</Label>
                  <Input 
                    id="scrapeUrlInput" 
                    type="url" 
                    placeholder="https://esempio.com/articolo" 
                    value={scrapeUrlInput}
                    onChange={(e) => setScrapeUrlInput(e.target.value)}
                    disabled={isScrapingAndProcessing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="scrapeCategoryInput" className="text-muted-foreground">Categoria Articolo</Label>
                  <Input 
                    id="scrapeCategoryInput" 
                    type="text" 
                    placeholder="Es: Recensioni Auto" 
                    value={scrapeCategory}
                    onChange={(e) => setScrapeCategory(e.target.value)}
                    disabled={isScrapingAndProcessing}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleScrapeAndProcess} disabled={isScrapingAndProcessing || !scrapeUrlInput || !scrapeCategory} className="w-full">
                  {isScrapingAndProcessing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2"/>}
                  Estrai ed Elabora con AI
                </Button> 
                {scrapedAndProcessedData && (
                  <div className="mt-6 space-y-4 border-t pt-4">
                    {scrapedAndProcessedData.error && <p className="text-sm text-destructive p-2 border border-destructive bg-destructive/10 rounded-md">{scrapedAndProcessedData.error}</p>}
                    
                    {scrapedAndProcessedData.extractedImageUrl && (!scrapedAndProcessedData.error || (scrapedAndProcessedData.error && scrapedAndProcessedData.processedContent)) && (
                      <div>
                        <Label className="font-semibold">Immagine Estratta:</Label>
                        <div className="mt-1 p-2 border rounded-md bg-muted flex justify-center">
                          <Image 
                            src={scrapedAndProcessedData.extractedImageUrl} 
                            alt="Immagine estratta" 
                            width={200} 
                            height={120} 
                            className="object-contain rounded-md max-h-[120px]"
                          />
                        </div>
                         <p className="text-xs text-muted-foreground mt-1 truncate text-center" title={scrapedAndProcessedData.extractedImageUrl}>
                            {scrapedAndProcessedData.extractedImageUrl}
                          </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <Label className="font-semibold">Titolo Elaborato:</Label>
                      {scrapedAndProcessedData.processedTitle && (!scrapedAndProcessedData.error || scrapedAndProcessedData.processedContent) && (
                         <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReviewAndEditProcessedArticle(scrapedAndProcessedData, scrapeCategory)}
                            title="Rivedi ed Edita Articolo Elaborato"
                            disabled={!scrapedAndProcessedData.processedContent}
                          >
                            <FileEdit className="h-3.5 w-3.5 mr-1" /> Rivedi
                          </Button>
                      )}
                    </div>
                    <p className="mt-1 p-2 border rounded-md bg-muted text-sm">{scrapedAndProcessedData.processedTitle || "N/D"}</p>
                    
                    <div>
                      <Label className="font-semibold">Meta Description:</Label>
                      <p className="mt-1 p-2 border rounded-md bg-muted text-sm">{scrapedAndProcessedData.metaDescription || "N/D"}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Keywords SEO:</Label>
                      <p className="mt-1 p-2 border rounded-md bg-muted text-sm">{scrapedAndProcessedData.seoKeywords.join(', ') || "N/D"}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Contenuto Elaborato (dall'AI):</Label>
                      <Textarea 
                        readOnly 
                        value={scrapedAndProcessedData.processedContent || "N/D"} 
                        rows={8} 
                        className="mt-1 bg-muted text-sm"
                      />
                    </div>
                     <p className="text-xs text-muted-foreground">URL Originale: {scrapedAndProcessedData.originalUrlScraped}</p>
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
                    <Send className="mr-2 h-4 w-4" />
                    Pubblica Post sul Blog
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonna Destra/Sidebar per altre info e gestione */}
        <aside className="space-y-6 order-2 lg:order-3 lg:col-span-1">
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
                <Users className="h-6 w-6 text-primary" />
                Gestione Iscritti Newsletter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <div className="flex-grow">
                    <Label htmlFor="newSubscriberEmail" className="text-xs text-muted-foreground">Nuova Email</Label>
                    <Input 
                      id="newSubscriberEmail"
                      type="email"
                      placeholder="email@esempio.com"
                      value={newSubscriberEmail}
                      onChange={(e) => setNewSubscriberEmail(e.target.value)}
                      disabled={isAddingSubscriber}
                      className="h-9"
                    />
                  </div>
                  <Button 
                    onClick={handleAddSubscriber} 
                    disabled={isAddingSubscriber || !newSubscriberEmail.trim()}
                    size="sm"
                    className="shrink-0"
                  >
                    {isAddingSubscriber ? <Loader2 className="animate-spin h-4 w-4" /> : <PlusCircle className="h-4 w-4"/>}
                  </Button>
                </div>
                 <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  disabled 
                >
                  Importa Iscritti (Prossimamente)
                </Button>
              </div>

              {isLoadingSubscribers ? (
                <div className="flex justify-center items-center p-4 mt-4">
                  <Loader2 className="animate-spin h-6 w-6 text-primary" />
                  <span className="ml-2">Caricamento iscritti...</span>
                </div>
              ) : newsletterSubscribers.length > 0 ? (
                <ul className="space-y-2 max-h-60 overflow-y-auto border p-2 rounded-md mt-4">
                  {newsletterSubscribers.map(sub => (
                    <li key={sub.id} className="text-sm p-1.5 bg-muted/50 rounded-sm">
                      <span className="font-medium">{sub.email}</span> - <span className="text-xs text-muted-foreground">Iscritto il: {sub.subscribedAt}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground mt-4 text-center">Nessun iscritto alla newsletter al momento.</p>
              )}
               <Button onClick={fetchNewsletterSubscribers} variant="outline" size="sm" className="mt-4 w-full">
                {isLoadingSubscribers ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                Aggiorna Lista Iscritti
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MailCheck className="h-6 w-6 text-primary" />
                Generazione Newsletter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="newsletterAdminPrompt">Contenuto Newsletter / Prompt AI</Label>
                <Textarea 
                    id="newsletterAdminPrompt" 
                    placeholder="Scrivi il contenuto o un prompt per l'AI per la newsletter..." 
                    rows={5} 
                    className="mt-1"
                    value={newsletterAdminPrompt}
                    onChange={(e) => setNewsletterAdminPrompt(e.target.value)}
                    disabled={isGeneratingNewsletter || isSendingNewsletter}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                    onClick={handleGenerateNewsletter} 
                    disabled={isGeneratingNewsletter || isSendingNewsletter || !newsletterAdminPrompt.trim()} 
                    className="flex-1"
                >
                  {isGeneratingNewsletter ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Genera con AI
                </Button>
                <Button 
                  onClick={handleSendNewsletter}
                  disabled={isSendingNewsletter || !generatedNewsletterSubject || !generatedNewsletterBody} 
                  variant="secondary" 
                  className="flex-1"
                >
                  {isSendingNewsletter ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                  Invia Newsletter (Simulato)
                </Button>
              </div>
              {generatedNewsletterSubject && generatedNewsletterBody && (
                <div className="mt-6 space-y-4 border-t pt-4">
                  <div>
                    <Label className="font-semibold">Oggetto Newsletter Generato:</Label>
                    <Input 
                        readOnly 
                        value={generatedNewsletterSubject} 
                        className="mt-1 bg-muted" 
                    />
                  </div>
                  <div>
                    <Label className="font-semibold">Corpo Newsletter Generato:</Label>
                    <Textarea 
                      readOnly 
                      value={generatedNewsletterBody} 
                      rows={10} 
                      className="mt-1 bg-muted text-sm"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
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
    
