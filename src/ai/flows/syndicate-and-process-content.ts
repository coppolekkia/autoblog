
'use server';
/**
 * @fileOverview Fetches items from an RSS/Atom feed, processes each item with AI,
 *               and returns the enhanced content.
 *
 * - syndicateAndProcessContent - Fetches feed items and processes them.
 * - SyndicateAndProcessContentInput - Input type.
 * - ProcessedArticleData - Output type for each processed article.
 * - SyndicateAndProcessContentOutput - Overall output type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchFeedItems, type FetchFeedItemsOutput } from './fetch-feed-items';
import { 
  processBlogPost, 
  type ProcessBlogPostInput, 
  type ProcessBlogPostOutput 
  // ProcessBlogPostOutputSchema is no longer imported as a value
} from './process-blog-post';

// Schema reso interno
const SyndicateAndProcessContentInputSchemaInternal = z.object({
  feedUrl: z.string().url({ message: "L'URL del feed non è valido." }),
  defaultCategory: z.string().min(1, { message: "La categoria è richiesta." }),
});
export type SyndicateAndProcessContentInput = z.infer<typeof SyndicateAndProcessContentInputSchemaInternal>;

// Schema reso interno, con campi di ProcessBlogPostOutput incollati qui
const ProcessedArticleDataSchemaInternal = z.object({
  // Campi da ProcessBlogPostOutput
  processedTitle: z.string().describe('Il titolo del post ottimizzato per SEO.'),
  processedContent: z
    .string()
    .describe('Il contenuto del post riscritto e ottimizzato per SEO e engagement.'),
  metaDescription: z
    .string()
    .describe('La meta description generata per il post.'),
  seoKeywords: z
    .array(z.string())
    .describe('Un elenco di 3-5 parole chiave SEO rilevanti.'),
  // Campi aggiuntivi
  originalLink: z.string().url().optional().describe("Il link all'articolo originale del feed."),
  originalTitleFromFeed: z.string().optional().describe("Il titolo originale dell'articolo del feed."),
});
export type ProcessedArticleData = z.infer<typeof ProcessedArticleDataSchemaInternal>;

// Schema reso interno
const SyndicateAndProcessContentOutputSchemaInternal = z.object({
  processedArticles: z.array(ProcessedArticleDataSchemaInternal).describe('Un elenco di articoli elaborati dal feed.'),
  errors: z.array(z.object({ originalTitle: z.string().optional(), error: z.string() })).optional().describe("Eventuali errori riscontrati durante l'elaborazione.")
});
export type SyndicateAndProcessContentOutput = z.infer<typeof SyndicateAndProcessContentOutputSchemaInternal>;

export async function syndicateAndProcessContent(input: SyndicateAndProcessContentInput): Promise<SyndicateAndProcessContentOutput> {
  return syndicateAndProcessContentFlow(input);
}

const syndicateAndProcessContentFlow = ai.defineFlow(
  {
    name: 'syndicateAndProcessContentFlow',
    inputSchema: SyndicateAndProcessContentInputSchemaInternal, // Usa schema interno
    outputSchema: SyndicateAndProcessContentOutputSchemaInternal, // Usa schema interno
  },
  async ({ feedUrl, defaultCategory }) => {
    const processedArticles: ProcessedArticleData[] = [];
    const processingErrors: { originalTitle?: string; error: string }[] = [];

    // 1. Fetch raw feed items
    const rawFeedResult: FetchFeedItemsOutput = await fetchFeedItems({ feedUrl });

    if (rawFeedResult.error || !rawFeedResult.items) {
      processingErrors.push({ error: `Errore nel recupero del feed: ${rawFeedResult.error || 'Nessun articolo grezzo trovato.'}` });
      return { processedArticles, errors: processingErrors };
    }

    if (rawFeedResult.items.length === 0) {
        return { processedArticles, errors: [{error: "Nessun articolo trovato nel feed."}] };
    }

    // 2. Process each item
    for (const item of rawFeedResult.items) {
      if (!item.title || !item.content) {
        processingErrors.push({ originalTitle: item.title, error: "Titolo o contenuto mancante per l'articolo del feed." });
        continue;
      }

      try {
        const processInput: ProcessBlogPostInput = {
          originalTitle: item.title,
          originalContent: item.content, 
          category: defaultCategory,
        };
        // Chiamata a processBlogPost che restituisce ProcessBlogPostOutput
        const processedResult: ProcessBlogPostOutput = await processBlogPost(processInput);
        
        // Mappatura manuale da ProcessBlogPostOutput a ProcessedArticleData
        processedArticles.push({
          processedTitle: processedResult.processedTitle,
          processedContent: processedResult.processedContent,
          metaDescription: processedResult.metaDescription,
          seoKeywords: processedResult.seoKeywords,
          originalLink: item.link,
          originalTitleFromFeed: item.title,
        });

      } catch (e: any) {
        console.error(`Errore durante l'elaborazione dell'articolo "${item.title}":`, e);
        processingErrors.push({ originalTitle: item.title, error: e.message || "Errore AI sconosciuto durante l'elaborazione dell'articolo." });
      }
    }

    return { processedArticles, errors: processingErrors.length > 0 ? processingErrors : undefined };
  }
);
