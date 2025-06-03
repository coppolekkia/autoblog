// src/components/blog/blog-feed-view.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { Button } from '@/components/ui/button';
// PageHeader import removed as it's no longer used here
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MessageSquare, ThumbsUp, Loader2 } from 'lucide-react';
import { usePosts } from "@/contexts/posts-context";

export function BlogFeedView() {
  const { posts } = usePosts();

  if (!posts || posts.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        {/* PageHeader removed from here */}
        <div className="text-center mt-12"> {/* Added margin-top for spacing */}
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">In attesa di caricamento articoli...</p>
            <p className="text-sm text-muted-foreground mt-2">L'admin può aggiungere contenuti dal pannello.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      {/* 
        PageHeader was here, removed as per request:
        <PageHeader
          title="Feed Principale" 
          description="Esplora gli ultimi articoli e discussioni."
        /> 
      */}
      <section className="max-w-4xl mx-auto space-y-8 mt-8"> {/* Added margin-top for spacing if header was providing it */}
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card flex flex-col">
            {post.imageUrl && (
              <Link href={`/blog/${post.slug}`} aria-label={`Leggi di più su ${post.title}`} className="block overflow-hidden">
                <Image
                  src={post.imageUrl}
                  alt={post.imageHint || post.title}
                  width={800}
                  height={450}
                  className="w-full h-auto object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                  data-ai-hint={post.imageHint || "blog image"}
                />
              </Link>
            )}
            <div className="p-6 flex-grow flex flex-col">
              <div className="flex items-center text-xs text-muted-foreground mb-3">
                {post.category && (
                  <Badge variant="secondary" className="mr-2">
                    <Link href={`/category/${post.category.toLowerCase()}`} className="hover:underline">
                      {post.category}
                    </Link>
                  </Badge>
                )}
                <span>Pubblicato da </span>
                <Link href={`/user/${post.author.toLowerCase().replace(' ', '-')}`} className="font-medium hover:underline ml-1 mr-1">
                  {post.author}
                </Link>
                <span>• {post.date}</span>
              </div>

              <CardTitle className="text-2xl font-semibold mb-3">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                  {post.title}
                </Link>
              </CardTitle>

              <p className="text-base text-foreground/80 mb-6 line-clamp-4 flex-grow">{post.excerpt}</p>

              <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-border/50">
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary px-2">
                    <ThumbsUp className="mr-1.5 h-4 w-4" />
                    <span>{post.upvotes}</span>
                  </Button>
                   <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                     <Link href={`/blog/${post.slug}#comments`}>
                      <span className="inline-flex items-center">
                        <MessageSquare className="mr-1.5 h-4 w-4" />
                        <span>{post.commentsCount} Commenti</span>
                      </span>
                    </Link>
                  </Button>
                </div>
                <Button asChild variant="default" size="sm">
                  <Link href={`/blog/${post.slug}`}>
                     <span className="inline-flex items-center">
                        Leggi di più
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
