
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-blog-title.ts';
import '@/ai/flows/generate-meta-description.ts';
import '@/ai/flows/content-expander.ts';
import '@/ai/flows/process-blog-post.ts';
import '@/ai/flows/fetch-feed-items.ts';
import '@/ai/flows/syndicate-and-process-content.ts'; // Aggiunto nuovo flusso

