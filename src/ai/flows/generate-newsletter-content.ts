'use server';
/**
 * @fileOverview Generates newsletter content (subject and body) based on an admin's prompt.
 *
 * - generateNewsletterContent - A function that handles the newsletter content generation.
 * - GenerateNewsletterInput - The input type for the generateNewsletterContent function.
 * - GenerateNewsletterOutput - The return type for the generateNewsletterContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNewsletterInputSchema = z.object({
  adminPrompt: z
    .string()
    .min(1, { message: 'Il prompt non può essere vuoto.' }) // Changed minLength from 10 to 1
    .describe('The prompt or instructions provided by the admin for the newsletter content.'),
  siteTitle: z
    .string()
    .describe('The current title of the website/blog, to be used for context in the newsletter.'),
});
export type GenerateNewsletterInput = z.infer<typeof GenerateNewsletterInputSchema>;

const GenerateNewsletterOutputSchema = z.object({
  subject: z.string().describe('The generated subject line for the newsletter.'),
  body: z
    .string()
    .describe('The generated body content for the newsletter, formatted for email readability (plain text or simple markdown).'),
});
export type GenerateNewsletterOutput = z.infer<typeof GenerateNewsletterOutputSchema>;

export async function generateNewsletterContent(input: GenerateNewsletterInput): Promise<GenerateNewsletterOutput> {
  return generateNewsletterContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNewsletterContentPrompt',
  input: {schema: GenerateNewsletterInputSchema},
  output: {schema: GenerateNewsletterOutputSchema},
  prompt: `Sei un esperto redattore di newsletter per un blog chiamato "{{siteTitle}}".
Il tuo compito è generare una newsletter basata sulle seguenti istruzioni fornite dall'amministratore.
La newsletter deve avere un oggetto chiaro e un corpo ben strutturato.
Il tono dovrebbe essere coinvolgente e informativo. Assicurati che l'output sia in testo semplice o Markdown semplice, adatto per una newsletter via email.

Istruzioni/Contenuto dall'Admin:
{{{adminPrompt}}}

Per favore, genera un oggetto accattivante e il contenuto principale del corpo.`,
});

const generateNewsletterContentFlow = ai.defineFlow(
  {
    name: 'generateNewsletterContentFlow',
    inputSchema: GenerateNewsletterInputSchema,
    outputSchema: GenerateNewsletterOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('L\'API AI non ha restituito un output per la newsletter.');
    }
    return output;
  }
);
