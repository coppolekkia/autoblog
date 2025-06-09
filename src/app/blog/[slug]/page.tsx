// src/app/blog/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site';
import PostPageClientContent from '@/components/blog/post-page-client-content';
import type { Post } from '@/types/blog';
import { placeholderPosts as initialPosts } from '@/types/blog'; // Import initial static posts

// --- INIZIO IDENTIFICAZIONE ADMIN TEMPORANEA ---
// !! IMPORTANTE !! Replicato da src/app/page.tsx per coerenza nell'header
const ADMIN_EMAIL = "coppolek@gmail.com";
// --- FINE IDENTIFICAZIONE ADMIN TEMPORANEA ---

type PostPageProps = {
  params: {
    slug: string;
  };
};

// Function to get post data based on slug from the initial static list
// This is used for server-side metadata generation.
// Client-side rendering will use PostsContext for the most up-to-date list.
async function getStaticPostBySlug(slug: string): Promise<Post | undefined> {
  return initialPosts.find((post) => post.slug === slug);
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getStaticPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post non Trovato',
      description: 'L\'articolo che stai cercando non è disponibile.',
    };
  }

  return {
    title: `${post.title} | ${siteConfig.name}`, // Consider using dynamic siteTitle from context for client if possible, but metadata is server
    description: post.excerpt,
    openGraph: {
        title: post.title,
        description: post.excerpt,
        type: 'article',
        url: `${siteConfig.url}/blog/${post.slug}`, // siteConfig.url might need to be dynamic if site changes
        images: [
            {
                url: post.imageUrl || siteConfig.ogImage, 
                width: 1200,
                height: 630,
                alt: post.title,
            },
        ],
    },
  };
}

// This is a Server Component. It can fetch initial data or pass params.
export default async function SinglePostPage({ params }: PostPageProps) {
  // We pass the slug to the client component, which will then use context to get the most up-to-date post list.
  // We don't strictly need to find the post here on the server if the client handles it,
  // but it's good for a quick check or if client-side fetching fails.
  // For now, PostPageClientContent will handle fetching from context.

  const { slug } = await params;
  return <PostPageClientContent slug={slug} adminEmail={ADMIN_EMAIL} />;
}