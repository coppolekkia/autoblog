'use server';

/**
 * @fileOverview A meta description generator AI agent.
 *
 * - generateMetaDescription - A function that handles the meta description generation process.
 * - GenerateMetaDescriptionInput - The input type for the generateMetaDescription function.
 * - GenerateMetaDescriptionOutput - The return type for the generateMetaDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMetaDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the blog post.'),
  keywords: z.string().describe('Keywords related to the blog post.'),
});
export type GenerateMetaDescriptionInput = z.infer<typeof GenerateMetaDescriptionInputSchema>;

const GenerateMetaDescriptionOutputSchema = z.object({
  metaDescription: z.string().describe('A concise meta description for the blog post.'),
});
export type GenerateMetaDescriptionOutput = z.infer<typeof GenerateMetaDescriptionOutputSchema>;

export async function generateMetaDescription(input: GenerateMetaDescriptionInput): Promise<GenerateMetaDescriptionOutput> {
  return generateMetaDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMetaDescriptionPrompt',
  input: {schema: GenerateMetaDescriptionInputSchema},
  output: {schema: GenerateMetaDescriptionOutputSchema},
  prompt: `You are an SEO expert. Generate a concise and engaging meta description for a blog post, 
  using the title and keywords provided. The meta description should be no more than 160 characters.

Title: {{{title}}}
Keywords: {{{keywords}}}

Meta Description: `,
});

const generateMetaDescriptionFlow = ai.defineFlow(
  {
    name: 'generateMetaDescriptionFlow',
    inputSchema: GenerateMetaDescriptionInputSchema,
    outputSchema: GenerateMetaDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
