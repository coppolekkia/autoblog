
"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePosts } from '@/contexts/posts-context';
import { slugify } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { List } from 'lucide-react'; // Icon for categories

export function CategoriesMenu() {
  const { posts } = usePosts();

  const categories = useMemo(() => {
    if (!posts || posts.length === 0) {
      return [];
    }
    const uniqueCategories = new Set<string>();
    posts.forEach(post => {
      if (post.category) {
        uniqueCategories.add(post.category);
      }
    });
    return Array.from(uniqueCategories).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  if (categories.length === 0) {
    return null; // Don't render if no categories
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2 md:px-3">
          <List className="h-4 w-4 md:mr-1" />
          <span className="hidden md:inline">Categorie</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
        <DropdownMenuLabel>Sfoglia per Categoria</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {categories.map(category => (
          <DropdownMenuItem key={category} asChild className="cursor-pointer">
            <Link href={`/category/${slugify(category)}`}>
              {category}
            </Link>
          </DropdownMenuItem>
        ))}
        {categories.length === 0 && (
            <DropdownMenuItem disabled>Nessuna categoria trovata</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
