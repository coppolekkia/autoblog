
// app/register/page.tsx
"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function RegisterDisabledPage() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen py-12">
      <PageHeader
        title="Registrazione Disabilitata"
        description="La creazione di nuovi account non è attualmente permessa."
      />
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle>Registrazione Non Disponibile</CardTitle>
          <CardDescription>
            Al momento, la registrazione di nuovi utenti è disabilitata.
            Questo sito è accessibile solo tramite credenziali di amministrazione.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla Homepage
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
