
'use server';
/**
 * @fileOverview Elabora un post di un blog per ottimizzare titolo, contenuto, generare meta description e keywords SEO.
 *
 * - processBlogPost - Funzione principale per l'elaborazione del post.
 * - ProcessBlogPostInput - Tipo di input per processBlogPost.
 * - ProcessBlogPostOutput - Tipo di output per processBlogPost.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {generateBlogTitle} from './generate-blog-title';
import {generateMetaDescription} from './generate-meta-description';

const ProcessBlogPostInputSchema = z.object({
  originalTitle: z.string().describe('Il titolo originale del post.'),
  originalContent: z
    .string()
    .min(50, {message: 'Il contenuto originale deve essere di almeno 50 caratteri.'})
    .describe('Il contenuto originale del post del blog.'),
  category: z.string().describe('La categoria del post del blog.'),
});
export type ProcessBlogPostInput = z.infer<typeof ProcessBlogPostInputSchema>;

// Schema Zod per l'output - reso interno
const ProcessBlogPostOutputSchemaInternal = z.object({
  processedTitle: z.string().describe('Il titolo del post ottimizzato per SEO.'),
  processedContent: z
    .string()
    .describe('Il contenuto del post riscritto e ottimizzato per SEO e engagement, con suggerimenti per link interni.'),
  metaDescription: z
    .string()
    .describe('La meta description generata per il post.'),
  seoKeywords: z
    .array(z.string())
    .describe('Un elenco di 3-5 parole chiave SEO rilevanti.'),
});
export type ProcessBlogPostOutput = z.infer<typeof ProcessBlogPostOutputSchemaInternal>;

// Prompt per la riscrittura e ottimizzazione del contenuto
const optimizeContentPrompt = ai.definePrompt({
  name: 'optimizeBlogPostContentPrompt',
  input: { schema: z.object({ originalContent: z.string(), category: z.string(), processedTitle: z.string() }) },
  output: { schema: z.object({ processedContent: z.string().describe("Il contenuto del post riscritto e ottimizzato, con suggerimenti per link interni.") }) },
  prompt: `Sei un esperto redattore di contenuti specializzato nell'ottimizzazione di post di blog per leggibilità, engagement e SEO, specifici per categoria.
Dato il seguente contenuto originale, il suo titolo (già ottimizzato per SEO) e la sua categoria, riscrivi e migliora il contenuto.
Assicurati che il tono sia appropriato per la categoria. Migliora la chiarezza, il flusso e incorpora la terminologia pertinente.
Rendi il contenuto più coinvolgente per il pubblico di destinazione della categoria. Integra naturalmente le parole chiave implicite nel titolo.
Non aggiungere un titolo al contenuto che generi, restituisci solo il corpo del post.

Titolo del Post (già ottimizzato): {{{processedTitle}}}
Contenuto Originale: {{{originalContent}}}
Categoria: {{{category}}}

Il tuo obiettivo principale è rendere il contenuto pronto per la pubblicazione in un blog di alta qualità.
Durante la riscrittura, identifica le opportunità per inserire link interni ad altri argomenti correlati che potrebbero essere trattati sul blog.
Per questi link interni suggeriti, usa il formato: \`[approfondisci: NOME_ARGOMENTO_CORRELATO]\`.
Ad esempio, se stai parlando di "motori elettrici" e pensi che un articolo su "batterie per auto elettriche" sarebbe un buon link interno, scriveresti: "... dettagli sui motori elettrici. [approfondisci: batterie per auto elettriche]".
Non inventare URL, usa solo questo formato placeholder.
Restituisci solo il contenuto riformulato e ottimizzato.`,
});

// Prompt per l'estrazione delle keyword SEO
const extractKeywordsPrompt = ai.definePrompt({
  name: 'extractSeoKeywordsPrompt',
  input: { schema: z.object({ processedTitle: z.string(), processedContent: z.string(), category: z.string() }) },
  output: { schema: z.object({ seoKeywords: z.array(z.string()).describe("Un elenco di 3-5 parole chiave SEO pertinenti.") }) },
  prompt: `Sei uno specialista SEO. Analizza il titolo e il contenuto del post del blog forniti, considerando la sua categoria,
ed estrai un elenco di 3-5 parole chiave SEO altamente pertinenti. Queste parole chiave dovrebbero essere adatte
per i meta tag e per indirizzare le query di ricerca. Restituisci le parole chiave come un elenco di stringhe.

Titolo: {{{processedTitle}}}
Contenuto: {{{processedContent}}}
Categoria: {{{category}}}`,
});


export async function processBlogPost(input: ProcessBlogPostInput): Promise<ProcessBlogPostOutput> {
  return processBlogPostFlow(input);
}

const processBlogPostFlow = ai.defineFlow(
  {
    name: 'processBlogPostFlow',
    inputSchema: ProcessBlogPostInputSchema,
    outputSchema: ProcessBlogPostOutputSchemaInternal, // Usa lo schema interno
  },
  async ({ originalTitle, originalContent, category }) => {
    // 1. Genera titolo ottimizzato
    const titleResult = await generateBlogTitle({ keywords: `${originalTitle} ${category}` });
    const processedTitle = titleResult.title;

    // 2. Riscrivi e ottimizza il contenuto
    const optimizeContentResult = await optimizeContentPrompt({ originalContent, category, processedTitle });
    const processedContent = optimizeContentResult.output?.processedContent ?? originalContent;
    
    // 3. Genera meta description
    const metaDescriptionResult = await generateMetaDescription({ title: processedTitle, keywords: category });
    const metaDescription = metaDescriptionResult.metaDescription;

    // 4. Estrai keywords SEO
    const keywordsResult = await extractKeywordsPrompt({ processedTitle, processedContent, category });
    const seoKeywords = keywordsResult.output?.seoKeywords ?? [];

    return {
      processedTitle,
      processedContent,
      metaDescription,
      seoKeywords,
    };
  }
);

