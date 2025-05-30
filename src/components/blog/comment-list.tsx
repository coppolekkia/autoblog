// src/components/blog/comment-list.tsx
"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { Loader2, MessageCircleOff } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button'; // Added import for Button

interface Comment {
  id: string;
  text: string;
  userId: string;
  userEmail: string;
  createdAt: Timestamp | null; // Firestore timestamp
}

interface CommentListProps {
  postId: string;
}

async function fetchComments(postId: string): Promise<Comment[]> {
  const commentsRef = collection(db, "comments");
  const q = query(
    commentsRef, 
    where("postId", "==", postId), 
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  const comments: Comment[] = [];
  querySnapshot.forEach((doc) => {
    comments.push({ id: doc.id, ...doc.data() } as Comment);
  });
  return comments;
}

function getAvatarFallback(email?: string | null) {
    if (!email) return "Ut";
    return email.substring(0, 2).toUpperCase();
}

export default function CommentList({ postId }: CommentListProps) {
  const { data: comments, isLoading, error, refetch } = useQuery<Comment[], Error>({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId),
    // staleTime: 5 * 60 * 1000, // Optional: comments are stale after 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Caricamento commenti...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive py-4">
        Errore nel caricamento dei commenti: {error.message}
        <Button onClick={() => refetch()} variant="outline" size="sm" className="ml-2">Riprova</Button>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircleOff className="mx-auto h-12 w-12 mb-2" />
        <p>Nessun commento ancora. Sii il primo a commentare!</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="flex items-start space-x-3 p-4 border rounded-lg bg-card shadow-sm">
          <Avatar className="h-10 w-10 border">
            {/* Placeholder for user image if available */}
            {/* <AvatarImage src={undefined} alt={comment.userEmail} /> */}
            <AvatarFallback>{getAvatarFallback(comment.userEmail)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{comment.userEmail}</p>
              <p className="text-xs text-muted-foreground">
                {comment.createdAt ? format(comment.createdAt.toDate(), "d MMMM yyyy 'alle' HH:mm", { locale: it }) : 'Data non disponibile'}
              </p>
            </div>
            <p className="mt-1 text-sm text-foreground/90 whitespace-pre-wrap">{comment.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
