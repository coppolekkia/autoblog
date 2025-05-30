
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

// Schema for output (extends ProcessBlogPostOutput and adds original URL and image)
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
  extractedImageUrl: z.string().url().optional().describe("L'URL dell'immagine principale estratta dalla pagina."),
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
    let extractedImageUrl: string | undefined = undefined;
    const basePageUrl = new URL(url);

    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      
      const { data: htmlContent, status } = await axios.get(proxyUrl, {
        headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 30000 // Timeout aumentato a 30 secondi
      });

      if (status !== 200 || typeof htmlContent !== 'string' || htmlContent.toLowerCase().includes('<error>') || htmlContent.toLowerCase().includes('proxy error') || htmlContent.toLowerCase().includes('cors error')) {
        console.warn(`Il proxy potrebbe aver restituito un errore o contenuto non valido per ${url}. Status: ${status}. Contenuto ricevuto: ${htmlContent.substring(0,200)}...`);
        return { 
            processedTitle: '', 
            processedContent: '',
            metaDescription: '',
            seoKeywords: [],
            originalUrlScraped: url,
            extractedImageUrl: undefined,
            error: `Il proxy (allorigins.win) non è riuscito a recuperare il contenuto da ${url} o ha restituito un contenuto non valido (es. pagina di errore del proxy). Status: ${status}.`
        };
      }
      
      const $ = cheerio.load(htmlContent);

      // Extract title
      extractedTitle = $('title').first().text().trim();
      if (!extractedTitle) extractedTitle = $('h1').first().text().trim();
      if (!extractedTitle) extractedTitle = $('meta[property="og:title"]').attr('content')?.trim() || '';
      if (!extractedTitle) extractedTitle = $('meta[name="twitter:title"]').attr('content')?.trim() || '';
      
      // Extract Image URL
      let imageUrl = $('meta[property="og:image"]').attr('content');
      if (!imageUrl) imageUrl = $('meta[name="twitter:image"]').attr('content');
      
      if (!imageUrl) {
        const mainContentSelectors = 'article, main, .content, .entry-content, .post-content, .article-body, #content, #main, #article';
        const $mainContent = $(mainContentSelectors).first();
        if ($mainContent.length) {
            imageUrl = $mainContent.find('img').first().attr('src');
        } else {
            imageUrl = $('body').find('img').first().attr('src');
        }
      }

      if (imageUrl) {
        try {
          const absoluteImageUrl = new URL(imageUrl, basePageUrl.origin);
          extractedImageUrl = absoluteImageUrl.href;
        } catch (e) {
          if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:image')) {
            extractedImageUrl = imageUrl;
          } else {
             console.warn(`Could not form absolute URL for image: ${imageUrl} on page ${url}`);
          }
        }
      }

      $('script, style, noscript, iframe, header, footer, nav, aside, form, img, svg, video, audio, link[rel="stylesheet"], link[rel="icon"], link[rel="shortcut icon"]').remove();
      
      let mainContentElement = $('article').first();
      if (!mainContentElement.length) mainContentElement = $('main').first();
      if (!mainContentElement.length) mainContentElement = $('.content, .entry-content, .post-content, .article-body, #content, #main, #article').first();
      if (!mainContentElement.length) mainContentElement = $('body'); 
      
      extractedBody = mainContentElement.find('p, div, span, li, h2, h3, h4, td')
        .map((i, el) => $(el).text().trim().replace(/\s\s+/g, ' '))
        .get()
        .filter(text => text.length > 20) 
        .join('\n\n'); 

      if (!extractedBody || extractedBody.length < MIN_CONTENT_LENGTH / 2) { 
        extractedBody = mainContentElement.text().replace(/\s\s+/g, ' ').trim(); 
      }

      if (!extractedTitle) extractedTitle = `Contenuto da ${basePageUrl.hostname}`;
      
      if (!extractedBody || extractedBody.length < MIN_CONTENT_LENGTH) {
        console.warn(`Contenuto estratto da ${url} (via proxy) troppo breve o mancante. Lunghezza: ${extractedBody.length}`);
        return { 
            processedTitle: extractedTitle, 
            processedContent: `Impossibile estrarre contenuto sufficiente da ${url} (via proxy). Lunghezza minima richiesta: ${MIN_CONTENT_LENGTH} caratteri. Contenuto trovato: ${extractedBody.substring(0, 200)}...`,
            metaDescription: '',
            seoKeywords: [],
            originalUrlScraped: url,
            extractedImageUrl,
            error: `Impossibile estrarre contenuto testuale significativo da ${url} (via proxy). Assicurati che la pagina abbia testo leggibile e non sia protetta dinamicamente o che il proxy funzioni.`
        };
      }

    } catch (e: any) {
      console.error(`Errore durante lo scraping di ${url} (via proxy):`, e);
      let errorMessage = "Errore sconosciuto durante lo scraping.";
      if (axios.isAxiosError(e)) {
        if (e.code === 'ECONNABORTED' || e.message.toLowerCase().includes('timeout')) {
           errorMessage = `Timeout della richiesta (${(e.config?.timeout || 30000)/1000}s) durante il tentativo di scraping di ${url} tramite proxy. Il sito potrebbe essere troppo lento, protetto, o il proxy non risponde.`;
        } else if (e.response) {
          errorMessage = `Il proxy ha restituito lo stato ${e.response.status} per ${url}.`;
        } else if (e.request) {
          errorMessage = `Nessuna risposta ricevuta dal proxy per ${url}. Controlla la connessione o la disponibilità del proxy.`;
        } else {
          errorMessage = e.message; 
        }
      } else {
        errorMessage = e.message || "Errore imprevisto durante lo scraping.";
      }
      return { 
        processedTitle: '', 
        processedContent: '',
        metaDescription: '',
        seoKeywords: [],
        originalUrlScraped: url,
        extractedImageUrl: undefined,
        error: `Errore durante lo scraping dell'URL ${url} (via proxy): ${errorMessage}`
      };
    }

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
        extractedImageUrl,
      };

    } catch (e: any) {
      console.error(`Errore durante l'elaborazione AI del contenuto estratto da ${url}:`, e);
      return { 
        processedTitle: extractedTitle, 
        processedContent: extractedBody, 
        metaDescription: '',
        seoKeywords: [],
        originalUrlScraped: url,
        extractedImageUrl,
        error: `Contenuto estratto (via proxy), ma l'elaborazione AI è fallita: ${e.message}` 
      };
    }
  }
);
