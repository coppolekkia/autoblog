
'use server';
/**
 * @fileOverview Fetches and parses items from an RSS/Atom feed URL.
 *
 * - fetchFeedItems - A function that fetches and parses feed items.
 * - FetchFeedItemsInput - The input type for the fetchFeedItems function.
 * - FeedItem - The structure of a single parsed feed item.
 * - FetchFeedItemsOutput - The return type for the fetchFeedItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import Parser from 'rss-parser';

const FetchFeedItemsInputSchema = z.object({
  feedUrl: z.string().url({ message: "L'URL del feed non è valido." }),
});
export type FetchFeedItemsInput = z.infer<typeof FetchFeedItemsInputSchema>;

export const FeedItemSchema = z.object({
  title: z.string().optional().describe('Il titolo dellarticolo del feed.'),
  link: z.string().optional().describe("Il link all'articolo originale del feed."),
  pubDate: z.string().optional().describe('La data di pubblicazione dellarticolo.'),
  content: z.string().optional().describe('Il contenuto o snippet dellarticolo del feed.'),
  guid: z.string().optional().describe('Un identificatore univoco per larticolo del feed.')
});
export type FeedItem = z.infer<typeof FeedItemSchema>;

const FetchFeedItemsOutputSchema = z.object({
  items: z.array(FeedItemSchema).describe('Un elenco di articoli recuperati dal feed.'),
  error: z.string().optional().describe("Messaggio di errore se il recupero o il parsing fallisce.")
});
export type FetchFeedItemsOutput = z.infer<typeof FetchFeedItemsOutputSchema>;

export async function fetchFeedItems(input: FetchFeedItemsInput): Promise<FetchFeedItemsOutput> {
  return fetchFeedItemsFlow(input);
}

const fetchFeedItemsFlow = ai.defineFlow(
  {
    name: 'fetchFeedItemsFlow',
    inputSchema: FetchFeedItemsInputSchema,
    outputSchema: FetchFeedItemsOutputSchema,
  },
  async ({ feedUrl }) => {
    const parser = new Parser();
    try {
      const feed = await parser.parseURL(feedUrl);
      const items: FeedItem[] = feed.items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        // rss-parser provides contentSnippet for summaries, or full content in item.content
        content: item.contentSnippet || item.content || '',
        guid: item.guid || item.link, // Use guid or link as a unique identifier
      }));
      return { items };
    } catch (error) {
      console.error(`Errore durante il fetch o parsing del feed ${feedUrl}:`, error);
      let errorMessage = "Errore sconosciuto durante il recupero del feed.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { items: [], error: `Impossibile caricare o analizzare il feed: ${errorMessage}` };
    }
  }
);
