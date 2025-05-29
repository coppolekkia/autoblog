'use server';
/**
 * @fileOverview Expands upon provided text snippets to create detailed blog post sections.
 *
 * - expandContent - A function that handles the content expansion process.
 * - ExpandContentInput - The input type for the expandContent function.
 * - ExpandContentOutput - The return type for the expandContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExpandContentInputSchema = z.object({
  textSnippet: z
    .string()
    .describe('The text snippet or outline to expand upon.'),
});
export type ExpandContentInput = z.infer<typeof ExpandContentInputSchema>;

const ExpandContentOutputSchema = z.object({
  expandedContent: z
    .string()
    .describe('The expanded content for the blog post section.'),
});
export type ExpandContentOutput = z.infer<typeof ExpandContentOutputSchema>;

export async function expandContent(input: ExpandContentInput): Promise<ExpandContentOutput> {
  return expandContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentExpanderPrompt',
  input: {schema: ExpandContentInputSchema},
  output: {schema: ExpandContentOutputSchema},
  prompt: `You are an expert blog post writer. Expand upon the following text snippet to create a detailed blog post section. The expanded section should be well-written, informative, and engaging.

Text Snippet: {{{textSnippet}}}`,
});

const expandContentFlow = ai.defineFlow(
  {
    name: 'expandContentFlow',
    inputSchema: ExpandContentInputSchema,
    outputSchema: ExpandContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
