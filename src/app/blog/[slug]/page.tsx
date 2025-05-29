// src/app/blog/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site';
import PostPageClientContent from '@/components/blog/post-page-client-content';
import type { Post } from '@/types/blog';

// --- INIZIO IDENTIFICAZIONE ADMIN TEMPORANEA ---
// !! IMPORTANTE !! Replicato da src/app/page.tsx per coerenza nell'header
const ADMIN_EMAIL = "coppolek@gmail.com";
// --- FINE IDENTIFICAZIONE ADMIN TEMPORANEA ---

// Placeholder data for blog posts
// In a real app, this would come from a CMS or database
const placeholderPosts: Post[] = [
  {
    id: 1,
    title: "Le Ultime Novità nel Mondo Automotive del 2024",
    slug: "novita-automotive-2024",
    excerpt: "Scopri le tendenze più calde, i modelli più attesi e le tecnologie emergenti che stanno definendo il futuro dell'auto.",
    content: "Questo è il contenuto completo dell'articolo sulle novità automotive del 2024. Qui troverai un'analisi approfondita delle nuove tecnologie, dei design più innovativi e delle aspettative di mercato per i prossimi anni. Parleremo di veicoli elettrici, guida autonoma, sostenibilità e molto altro ancora. Continua a leggere per scoprire cosa ci riserva il futuro!",
    imageUrl: "https://placehold.co/700x400.png",
    imageHint: "modern car concept",
    date: "15 Luglio 2024",
    author: "AutoContentAI Team",
    upvotes: 125,
    commentsCount: 23,
    category: "Novità"
  },
  {
    id: 2,
    title: "Guida Completa alla Manutenzione della Tua Auto Elettrica",
    slug: "manutenzione-auto-elettrica",
    excerpt: "Consigli pratici e suggerimenti per mantenere la tua auto elettrica in perfette condizioni e massimizzare la durata della batteria.",
    content: "La manutenzione di un'auto elettrica differisce significativamente da quella di un veicolo tradizionale. In questa guida completa, esploreremo tutti gli aspetti: dalla cura della batteria, ai controlli dei sistemi elettrici, fino alla manutenzione di freni e pneumatici. Imparerai come estendere la vita della tua auto e viaggiare in sicurezza.",
    imageUrl: "https://placehold.co/700x400.png",
    imageHint: "electric car maintenance",
    date: "10 Luglio 2024",
    author: "Mario Rossi",
    upvotes: 98,
    commentsCount: 15,
    category: "Guide Pratiche"
  },
  {
    id: 3,
    title: "I SUV più Affidabili sul Mercato: Classifica e Recensioni",
    slug: "suv-affidabili-recensioni",
    excerpt: "Una panoramica dettagliata dei SUV che si distinguono per affidabilità, sicurezza e prestazioni. Trova il modello giusto per te.",
    content: "Scegliere un SUV affidabile è fondamentale per la tranquillità e la sicurezza della famiglia. In questo articolo, analizziamo i modelli più recenti, confrontando test di affidabilità, valutazioni di sicurezza, feedback dei proprietari e costi di manutenzione. Scopri la nostra classifica e le recensioni dettagliate per fare la scelta migliore.",
    imageUrl: "https://placehold.co/700x400.png",
    imageHint: "suv lineup",
    date: "5 Luglio 2024",
    author: "Giulia Bianchi",
    upvotes: 210,
    commentsCount: 45,
    category: "Recensioni"
  },
];

type PostPageProps = {
  params: {
    slug: string;
  };
};

// Function to get post data based on slug
async function getPostBySlug(slug: string): Promise<Post | undefined> {
  return placeholderPosts.find((post) => post.slug === slug);
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post non Trovato',
    };
  }

  return {
    title: `${post.title} | ${siteConfig.name}`,
    description: post.excerpt,
    openGraph: {
        title: post.title,
        description: post.excerpt,
        type: 'article',
        url: `${siteConfig.url}/blog/${post.slug}`,
        images: [
            {
                url: post.imageUrl || siteConfig.ogImage, // Fallback to site OG image
                width: 1200,
                height: 630,
                alt: post.title,
            },
        ],
    },
  };
}

export default async function SinglePostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound(); // Triggers the not-found.tsx page or a default 404
  }
  
  return <PostPageClientContent post={post} adminEmail={ADMIN_EMAIL} />;
}
