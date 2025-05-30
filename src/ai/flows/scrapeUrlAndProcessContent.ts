
'use server';
/**
 * @fileOverview Scrapes content from a given URL and processes it using AI.
 *
 * - scrapeUrlAndProcessContent - Main function to scrape and process.
 * - ScrapeUrlAndProcessContentInput - Input type.
 * - ScrapedAndProcessedArticleData - Output type for the processed article.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { 
  processBlogPost, 
  type ProcessBlogPostInput, 
  type ProcessBlogPostOutput 
} from './process-blog-post';

// Schema for input
const ScrapeUrlAndProcessContentInputSchema = z.object({
  url: z.string().url({ message: "L'URL fornito non è valido." }),
  category: z.string().min(1, { message: "La categoria è richiesta." }),
});
export type ScrapeUrlAndProcessContentInput = z.infer<typeof ScrapeUrlAndProcessContentInputSchema>;

// Schema for output (extends ProcessBlogPostOutput and adds original URL)
const ScrapedAndProcessedArticleDataSchema = z.object({
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
  originalUrlScraped: z.string().url().describe("L'URL originale da cui è stato estratto il contenuto."),
  error: z.string().optional().describe("Messaggio di errore se l'estrazione o l'elaborazione fallisce.")
});
export type ScrapedAndProcessedArticleData = z.infer<typeof ScrapedAndProcessedArticleDataSchema>;


export async function scrapeUrlAndProcessContent(input: ScrapeUrlAndProcessContentInput): Promise<ScrapedAndProcessedArticleData> {
  return scrapeUrlAndProcessContentFlow(input);
}

const MIN_CONTENT_LENGTH = 100; // Minimum characters for extracted content to be considered valid

const scrapeUrlAndProcessContentFlow = ai.defineFlow(
  {
    name: 'scrapeUrlAndProcessContentFlow',
    inputSchema: ScrapeUrlAndProcessContentInputSchema,
    outputSchema: ScrapedAndProcessedArticleDataSchema,
  },
  async ({ url, category }) => {
    let extractedTitle = '';
    let extractedBody = '';

    try {
      const { data: htmlContent } = await axios.get(url, {
        headers: { // Some sites might block requests without a common user-agent
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const $ = cheerio.load(htmlContent);

      // Extract title
      extractedTitle = $('title').first().text().trim();
      if (!extractedTitle) {
         // Fallback: try to get from h1
        extractedTitle = $('h1').first().text().trim();
      }

      // Extract main content - this is a very basic approach and can be improved
      // Remove script and style tags first to clean up
      $('script, style, noscript, iframe, header, footer, nav, aside, form').remove();
      
      // Try common article containers
      let mainContentElement = $('article').first();
      if (!mainContentElement.length) {
        mainContentElement = $('main').first();
      }
      if (!mainContentElement.length) {
        // Fallback to body if specific tags are not found
        mainContentElement = $('body'); 
      }
      
      // Get text, trying to preserve some structure by joining paragraphs
      extractedBody = mainContentElement.find('p').map((i, el) => $(el).text().trim()).get().join('\n\n');

      if (!extractedBody || extractedBody.length < MIN_CONTENT_LENGTH / 2) { // If paragraphs yield too little, try the whole element
        extractedBody = mainContentElement.text().replace(/\s\s+/g, ' ').trim(); // Clean up whitespace
      }


      if (!extractedTitle) {
        // If still no title, use a generic one
        extractedTitle = `Contenuto da ${new URL(url).hostname}`;
      }
      if (!extractedBody || extractedBody.length < MIN_CONTENT_LENGTH) {
        console.warn(`Contenuto estratto da ${url} troppo breve o mancante. Lunghezza: ${extractedBody.length}`);
        return { 
            processedTitle: extractedTitle, 
            processedContent: `Impossibile estrarre contenuto sufficiente da ${url}. Lunghezza minima richiesta: ${MIN_CONTENT_LENGTH} caratteri.`,
            metaDescription: '',
            seoKeywords: [],
            originalUrlScraped: url,
            error: `Impossibile estrarre contenuto testuale significativo da ${url}. Assicurati che la pagina abbia testo leggibile e non sia protetta dinamicamente.`
        };
      }

    } catch (e: any) {
      console.error(`Errore durante lo scraping di ${url}:`, e.message);
      return { 
        processedTitle: '', 
        processedContent: '',
        metaDescription: '',
        seoKeywords: [],
        originalUrlScraped: url,
        error: `Errore durante lo scraping dell'URL ${url}: ${e.message}`
      };
    }

    // Now, process the extracted content with AI
    try {
      const processInput: ProcessBlogPostInput = {
        originalTitle: extractedTitle,
        originalContent: extractedBody,
        category: category,
      };
      
      const processedResult: ProcessBlogPostOutput = await processBlogPost(processInput);
      
      return {
        ...processedResult,
        originalUrlScraped: url,
      };

    } catch (e: any) {
      console.error(`Errore durante l'elaborazione AI del contenuto estratto da ${url}:`, e);
      return { 
        processedTitle: extractedTitle, // Return extracted if AI fails
        processedContent: extractedBody,
        metaDescription: '',
        seoKeywords: [],
        originalUrlScraped: url,
        error: `Contenuto estratto, ma l'elaborazione AI è fallita: ${e.message}` 
      };
    }
  }
);
