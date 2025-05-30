
// src/components/blog/comment-form.tsx
"use client";

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label'; // Not strictly used, but good to keep if form grows
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';

const commentSchema = z.object({
  text: z.string().min(3, { message: "Il commento deve contenere almeno 3 caratteri." }).max(500, { message: "Il commento non può superare i 500 caratteri." }),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentFormProps {
  postId: string; // ID del post a cui il commento è associato
}

export default function CommentForm({ postId }: CommentFormProps) {
  const { currentUser } = useAuth(); // We still use this to get user info if available
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      text: "",
    },
  });

  const onSubmit: SubmitHandler<CommentFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const userIdToSave = currentUser ? currentUser.uid : "anonymous";
      const userEmailToSave = currentUser ? (currentUser.email || "Utente Loggato") : "Anonimo";

      await addDoc(collection(db, "comments"), {
        postId: postId,
        text: data.text,
        userId: userIdToSave,
        userEmail: userEmailToSave,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Commento Inviato!",
        description: "Il tuo commento è stato pubblicato.",
      });
      form.reset(); // Resetta il form dopo l'invio
    } catch (error) {
      console.error("Errore durante l'invio del commento:", error);
      toast({
        title: "Errore Invio Commento",
        description: "Impossibile inviare il commento. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Il form è sempre visibile
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="commentText">Lascia un commento</FormLabel>
              <FormControl>
                <Textarea
                  id="commentText"
                  placeholder="Scrivi il tuo commento qui..."
                  rows={4}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Invio in corso...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Invia Commento
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
