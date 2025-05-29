// src/app/(app)/page.tsx
"use client"; 

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context'; 
import DashboardPage from './dashboard/page';
import { Loader2 } from 'lucide-react';

// !! IMPORTANTE !! Replicato da src/app/page.tsx per coerenza nell'identificazione dell'admin
const ADMIN_EMAIL = "coppolek@gmail.com";

export default function AppRootPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.push('/login'); // Reindirizza alla pagina di login se non autenticato
      } else if (currentUser.email === ADMIN_EMAIL) {
        // Se l'utente loggato è l'admin e tenta di accedere a una pagina
        // gestita da questo layout (es. /dashboard), reindirizzalo alla homepage (/)
        // che è la sua dashboard/pannello admin.
        router.push('/');
      }
      // Se l'utente è loggato e NON è admin, rimarrà su questa pagina
      // e vedrà DashboardPage (o un'altra pagina specifica se navigato direttamente).
    }
  }, [currentUser, loading, router]);

  if (loading || !currentUser || (currentUser && currentUser.email === ADMIN_EMAIL)) {
    // Mostra un loader mentre verifica lo stato, se non c'è utente (verrà reindirizzato),
    // o se l'utente è l'admin (verrà reindirizzato a /).
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Se l'utente è loggato e NON è admin, mostra la DashboardPage
  // (Next.js gestirà il rendering di dashboard/page.tsx tramite il sistema di routing)
  return <DashboardPage />;
}
