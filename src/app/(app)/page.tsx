// src/app/(app)/page.tsx
"use client"; // Aggiunto per utilizzare hook come useEffect e useRouter

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context'; // Assicurati che il percorso sia corretto
import DashboardPage from './dashboard/page';
import { Loader2 } from 'lucide-react';

export default function AppRootPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login'); // Reindirizza alla pagina di login se non autenticato
    }
  }, [currentUser, loading, router]);

  if (loading || !currentUser) {
    // Mostra un loader o null mentre verifica lo stato o reindirizza
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Se l'utente è loggato, mostra la Dashboard
  // (Next.js gestirà il rendering di dashboard/page.tsx tramite il sistema di routing)
  return <DashboardPage />;
}
