// src/contexts/posts-context.tsx
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect } from "react";
import type { Post } from "@/types/blog";
import { placeholderPosts as initialPosts } from "@/types/blog"; 
import { slugify } from "@/lib/utils"; // Import slugify

interface PostsContextType {
  posts: Post[];
  addPost: (postData: Omit<Post, "id" | "slug" | "date" | "upvotes" | "commentsCount" | "author"> & { category: string; imageUrl?: string; imageHint?: string }) => void;
  getPostBySlug: (slug: string) => Post | undefined;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function usePosts() {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
}

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(() => {
    if (typeof window !== "undefined") {
      const savedPosts = localStorage.getItem("blogPosts");
      return savedPosts ? JSON.parse(savedPosts) : initialPosts;
    }
    return initialPosts; 
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedPosts = localStorage.getItem("blogPosts");
    if (savedPosts) {
      try {
        const parsedPosts = JSON.parse(savedPosts);
        // Basic validation to ensure it's an array
        if (Array.isArray(parsedPosts)) {
            setPosts(parsedPosts);
        } else {
            setPosts(initialPosts);
        }
      } catch (e) {
        console.error("Error parsing posts from localStorage", e);
        setPosts(initialPosts);
      }
    } else {
      setPosts(initialPosts); 
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("blogPosts", JSON.stringify(posts));
    }
  }, [posts, isMounted]);


  const addPost = (newPostData: Omit<Post, "id" | "slug" | "date" | "upvotes" | "commentsCount" | "author"> & { category: string; imageUrl?: string; imageHint?: string }) => {
    
    let uniqueSlug = slugify(newPostData.title);
    let counter = 1;
    // Ensure slug is unique
    while (posts.some(p => p.slug === uniqueSlug)) {
      uniqueSlug = `${slugify(newPostData.title)}-${counter}`;
      counter++;
    }
    
    const newPost: Post = {
      ...newPostData,
      id: Date.now().toString(), 
      slug: uniqueSlug,
      date: new Date().toLocaleDateString("it-IT", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      author: "Admin", 
      upvotes: Math.floor(Math.random() * 100), // Random upvotes for demo
      commentsCount: Math.floor(Math.random() * 20), // Random comments for demo
      imageUrl: newPostData.imageUrl || `https://placehold.co/700x400.png?text=${encodeURIComponent(newPostData.title)}`,
      imageHint: newPostData.imageHint || newPostData.title.split(' ').slice(0,2).join(' ') || "immagine blog", // Use title words as hint if not provided
    };

    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const getPostBySlug = (slug: string): Post | undefined => {
    return posts.find((post) => post.slug === slug);
  };
  
  const value = {
    posts,
    addPost,
    getPostBySlug,
  };

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
}
