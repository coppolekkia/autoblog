// src/app/category/[categorySlug]/page.tsx (Server Component)
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import CategoryClientPage from '@/components/category/category-client-page';

type CategoryPageProps = {
  params: {
    categorySlug: string;
  };
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  // Decode slug for display, assuming simple slugify (replace dash with space, capitalize)
  const categoryName = params.categorySlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return {
    title: `${categoryName} | ${siteConfig.name}`,
    description: `Esplora articoli e notizie nella categoria ${categoryName} su ${siteConfig.name}.`,
    // Add other relevant metadata like OpenGraph tags if needed
    openGraph: {
        title: `${categoryName} | ${siteConfig.name}`,
        description: `Articoli nella categoria ${categoryName}.`,
        url: `${siteConfig.url}/category/${params.categorySlug}`,
        images: [
            {
                url: siteConfig.ogImage, // Use a generic OG image or one specific to categories
                width: 1200,
                height: 630,
                alt: `Categoria ${categoryName}`,
            },
        ],
    },
  };
}

export default async function CategoryPageServer({ params }: CategoryPageProps) {
  // We pass the slug to the client component.
  // The client component will use PostsContext to filter and display posts.
  return <CategoryClientPage categorySlug={params.categorySlug} />;
}
