// src/types/blog.ts
export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  imageHint?: string;
  date: string;
  author: string;
  upvotes: number;
  commentsCount: number;
  category?: string;
}
