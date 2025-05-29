// src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { siteConfig } from '@/config/site';
import { ArrowRight } from 'lucide-react';

// Placeholder data for blog posts
const placeholderPosts = [
  {
    id: 1,
    title: "Le Ultime Novità nel Mondo Automotive del 2024",
    slug: "novita-automotive-2024",
    excerpt: "Scopri le tendenze più calde, i modelli più attesi e le tecnologie emergenti che stanno definendo il futuro dell'auto.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "modern car",
    date: "15 Luglio 2024",
    author: "AutoContentAI Team",
  },
  {
    id: 2,
    title: "Guida Completa alla Manutenzione della Tua Auto Elettrica",
    slug: "manutenzione-auto-elettrica",
    excerpt: "Consigli pratici e suggerimenti per mantenere la tua auto elettrica in perfette condizioni e massimizzare la durata della batteria.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "electric vehicle charging",
    date: "10 Luglio 2024",
    author: "AutoContentAI Team",
  },
  {
    id: 3,
    title: "I SUV più Affidabili sul Mercato: Classifica e Recensioni",
    slug: "suv-affidabili-recensioni",
    excerpt: "Una panoramica dettagliata dei SUV che si distinguono per affidabilità, sicurezza e prestazioni. Trova il modello giusto per te.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "suv family car",
    date: "5 Luglio 2024",
    author: "AutoContentAI Team",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Public Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            {/* You can use an icon or text for your site name */}
            <span className="font-bold text-xl text-primary">{siteConfig.name} Blog</span>
          </Link>
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button variant="default" asChild>
              <Link href="/register">Registrati</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
          <PageHeader
            title="Benvenuti sul Blog di AutoContentAI"
            description="Notizie, approfondimenti e guide sul mondo dell'automobile."
          />

          {/* Hero Section Example (Optional) */}
          <section className="mb-12">
            <Card className="overflow-hidden shadow-lg">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <Image
                    src="https://placehold.co/800x500.png"
                    alt="Featured blog post"
                    width={800}
                    height={500}
                    className="object-cover w-full h-64 md:h-full"
                    data-ai-hint="car driving sunset"
                  />
                </div>
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                  <h2 className="text-3xl font-bold text-primary mb-3">
                    Il Futuro della Guida è Qui
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Esplora le innovazioni che stanno trasformando il settore automobilistico, dalla guida autonoma alle soluzioni di mobilità sostenibile.
                  </p>
                  <Button asChild size="lg" className="self-start">
                    <Link href={`/blog/${placeholderPosts[0].slug}`}>
                      Leggi l'articolo in evidenza <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </section>
          
          <section>
            <h2 className="text-3xl font-semibold tracking-tight mb-8 text-center">
              Ultimi Articoli
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {placeholderPosts.map((post) => (
                <Card key={post.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <Link href={`/blog/${post.slug}`} aria-label={`Leggi di più su ${post.title}`}>
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      width={600}
                      height={400}
                      className="w-full h-48 object-cover"
                      data-ai-hint={post.imageHint}
                    />
                  </Link>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      Pubblicato il {post.date} da {post.author}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/blog/${post.slug}`}>
                        Leggi di più <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Public Footer */}
      <footer className="py-8 mt-12 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. Tutti i diritti riservati.</p>
          <p className="text-sm">
            Powered by AI for a better driving content experience.
          </p>
        </div>
      </footer>
    </div>
  );
}
