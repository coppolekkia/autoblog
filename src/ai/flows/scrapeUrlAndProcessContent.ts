
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
      // Use a public proxy to try and circumvent blocking
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      
      const { data: htmlContent } = await axios.get(proxyUrl, {
        headers: { 
            // User-Agent might be less critical when going through a proxy, but kept for completeness
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000 // Add a timeout of 15 seconds as proxies can be slow
      });
      const $ = cheerio.load(htmlContent);

      // Extract title
      extractedTitle = $('title').first().text().trim();
      if (!extractedTitle) {
         // Fallback: try to get from h1
        extractedTitle = $('h1').first().text().trim();
      }
      if (!extractedTitle) {
        // Fallback: try to get from meta og:title
        extractedTitle = $('meta[property="og:title"]').attr('content')?.trim() || '';
      }
       if (!extractedTitle) {
        // Fallback: try to get from meta twitter:title
        extractedTitle = $('meta[name="twitter:title"]').attr('content')?.trim() || '';
      }


      // Extract main content - this is a very basic approach and can be improved
      // Remove script and style tags first to clean up
      $('script, style, noscript, iframe, header, footer, nav, aside, form, img, svg, video, audio, link[rel="stylesheet"], link[rel="icon"], link[rel="shortcut icon"]').remove();
      
      // Try common article containers
      let mainContentElement = $('article').first();
      if (!mainContentElement.length) {
        mainContentElement = $('main').first();
      }
      if (!mainContentElement.length) {
        // More specific content selectors
        mainContentElement = $('.content, .entry-content, .post-content, .article-body, #content, #main, #article').first();
      }
      if (!mainContentElement.length) {
        // Fallback to body if specific tags are not found
        mainContentElement = $('body'); 
      }
      
      // Get text, trying to preserve some structure by joining paragraphs
      extractedBody = mainContentElement.find('p, div, span, li, h2, h3, h4, td') // Added more potential text holding elements
        .map((i, el) => {
            let text = $(el).text().trim();
            // Replace multiple newlines/spaces with a single space or newline for paragraphs
            text = text.replace(/\s\s+/g, ' '); 
            return text;
        })
        .get()
        .filter(text => text.length > 20) // Filter out very short/irrelevant text blocks
        .join('\n\n'); // Join paragraphs with double newlines

      if (!extractedBody || extractedBody.length < MIN_CONTENT_LENGTH / 2) { 
        extractedBody = mainContentElement.text().replace(/\s\s+/g, ' ').trim(); 
      }


      if (!extractedTitle) {
        extractedTitle = `Contenuto da ${new URL(url).hostname}`;
      }
      if (!extractedBody || extractedBody.length < MIN_CONTENT_LENGTH) {
        console.warn(`Contenuto estratto da ${url} (via proxy) troppo breve o mancante. Lunghezza: ${extractedBody.length}`);
        return { 
            processedTitle: extractedTitle, 
            processedContent: `Impossibile estrarre contenuto sufficiente da ${url} (via proxy). Lunghezza minima richiesta: ${MIN_CONTENT_LENGTH} caratteri. Contenuto trovato: ${extractedBody.substring(0, 200)}...`,
            metaDescription: '',
            seoKeywords: [],
            originalUrlScraped: url,
            error: `Impossibile estrarre contenuto testuale significativo da ${url} (via proxy). Assicurati che la pagina abbia testo leggibile e non sia protetta dinamicamente o che il proxy funzioni.`
        };
      }

    } catch (e: any) {
      console.error(`Errore durante lo scraping di ${url} (via proxy):`, e.message);
      let errorMessage = e.message;
      if (axios.isAxiosError(e) && e.response) {
        errorMessage = `Request failed with status code ${e.response.status} via proxy.`;
      } else if (e.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out via proxy.';
      }
      return { 
        processedTitle: '', 
        processedContent: '',
        metaDescription: '',
        seoKeywords: [],
        originalUrlScraped: url,
        error: `Errore durante lo scraping dell'URL ${url} (via proxy): ${errorMessage}`
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
        processedTitle: extractedTitle, 
        processedContent: extractedBody,
        metaDescription: '',
        seoKeywords: [],
        originalUrlScraped: url,
        error: `Contenuto estratto (via proxy), ma l'elaborazione AI è fallita: ${e.message}` 
      };
    }
  }
);

