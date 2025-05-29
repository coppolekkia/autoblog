
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-blog-title.ts';
import '@/ai/flows/generate-meta-description.ts';
import '@/ai/flows/content-expander.ts';
import '@/ai/flows/process-blog-post.ts'; // Aggiunto nuovo flusso
