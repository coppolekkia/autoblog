// src/contexts/posts-context.tsx
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect } from "react";
import type { Post } from "@/types/blog";
import { placeholderPosts as initialPosts } from "@/types/blog"; // Import initial posts

interface PostsContextType {
  posts: Post[];
  addPost: (post: Omit<Post, "id" | "slug" | "date" | "upvotes" | "commentsCount" | "author"> & { category: string }) => void;
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
    return initialPosts; // For SSR or initial state before client mounts
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedPosts = localStorage.getItem("blogPosts");
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      setPosts(initialPosts); // Ensure initialPosts are set if nothing in localStorage
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("blogPosts", JSON.stringify(posts));
    }
  }, [posts, isMounted]);

  const slugify = (text: string): string => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w-]+/g, "") // Remove all non-word chars
      .replace(/--+/g, "-"); // Replace multiple - with single -
  };

  const addPost = (newPostData: Omit<Post, "id" | "slug" | "date" | "upvotes" | "commentsCount" | "author"> & { category: string }) => {
    const newPost: Post = {
      ...newPostData,
      id: Date.now().toString(), // Simple unique ID
      slug: slugify(newPostData.title),
      date: new Date().toLocaleDateString("it-IT", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      author: "Admin", // Or derive from logged-in user if available
      upvotes: 0,
      commentsCount: 0,
      imageUrl: newPostData.imageUrl || `https://placehold.co/700x400.png?text=${encodeURIComponent(newPostData.title)}`,
      imageHint: newPostData.imageHint || "blog post image",
    };

    // Check for duplicate slugs
    let finalSlug = newPost.slug;
    let counter = 1;
    while (posts.some(p => p.slug === finalSlug)) {
      finalSlug = `${newPost.slug}-${counter}`;
      counter++;
    }
    newPost.slug = finalSlug;

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
