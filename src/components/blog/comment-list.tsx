
// src/components/blog/comment-list.tsx
"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore'; // Ensure Timestamp is imported
import { Loader2, MessageCircleOff } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

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
  if (!postId) {
    console.warn("fetchComments called with no postId, returning empty array.");
    return [];
  }
  console.log(`Fetching comments for postId: ${postId}`); // Log per debugging
  const commentsRef = collection(db, "comments");
  const q = query(
    commentsRef, 
    where("postId", "==", postId), 
    orderBy("createdAt", "desc")
  );

  try {
    const querySnapshot = await getDocs(q);
    const comments: Comment[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let createdAtTimestamp: Timestamp | null = null;

      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        // It's a Firestore Timestamp object
        createdAtTimestamp = data.createdAt as Timestamp;
      } else if (data.createdAt) {
        // Log if createdAt exists but is not in the expected Timestamp format
        console.warn(`Comment ${doc.id} has a 'createdAt' field but it's not a valid Firestore Timestamp. Value:`, data.createdAt);
      }

      comments.push({
        id: doc.id,
        text: data.text || "", // Default to empty string if text is missing
        userId: data.userId || "unknown",
        userEmail: data.userEmail || "Unknown User",
        createdAt: createdAtTimestamp,
      });
    });
    console.log(`Fetched ${comments.length} comments for postId: ${postId}`);
    return comments;
  } catch (err) {
    console.error(`Error fetching comments for postId ${postId}:`, err);
    throw err; // Re-throw to let react-query handle it
  }
}

function getAvatarFallback(email?: string | null) {
    if (!email) return "Ut";
    const trimmedEmail = email.trim();
    if (trimmedEmail.length < 2 && trimmedEmail.length > 0) return trimmedEmail.toUpperCase();
    if (trimmedEmail.length === 0) return "Ut";
    return trimmedEmail.substring(0, 2).toUpperCase();
}

export default function CommentList({ postId }: CommentListProps) {
  const { data: comments, isLoading, error, refetch, isError } = useQuery<Comment[], Error>({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId),
    enabled: !!postId, // Only run query if postId is truthy
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

  if (isError) { // Use isError state from useQuery
    return (
      <div className="text-destructive py-4">
        <p>Errore nel caricamento dei commenti: {error?.message || "Errore sconosciuto."}</p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="ml-2 mt-2">
          Riprova
        </Button>
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
              <p className="text-sm font-semibold text-foreground break-all">{comment.userEmail}</p>
              <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                {comment.createdAt ? format(comment.createdAt.toDate(), "d MMM yy HH:mm", { locale: it }) : 'Data non disp.'}
              </p>
            </div>
            <p className="mt-1 text-sm text-foreground/90 whitespace-pre-wrap">{comment.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
