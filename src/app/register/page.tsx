// app/register/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

// Inline SVG for Google Icon
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
);

const formSchema = z.object({
  email: z.string().email({ message: "Inserisci un'email valida." }),
  password: z.string().min(6, { message: "La password deve contenere almeno 6 caratteri." }),
  confirmPassword: z.string().min(6, { message: "La password deve contenere almeno 6 caratteri." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const { signUp, signInWithGoogle, currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password);
      toast({
        title: "Registrazione Riuscita!",
        description: "Il tuo account è stato creato con successo.",
      });
      router.push("/dashboard"); 
    } catch (error: any) {
      console.error("Errore di registrazione:", error);
      let errorMessage = "Si è verificato un errore imprevisto. Riprova.";
       if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Questa email è già in uso. Prova con un'altra email o accedi.";
      }
      toast({
        title: "Errore di Registrazione",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle(); // Firebase gestisce la creazione dell'utente se non esiste
      toast({
        title: "Registrazione con Google Riuscita!",
        description: "Il tuo account è stato creato con successo.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Errore di registrazione con Google:", error);
      toast({
        title: "Errore di Registrazione con Google",
        description: error.message || "Si è verificato un errore imprevisto durante la registrazione con Google.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };
  
  if (currentUser && !isLoading && !isGoogleLoading) {
    return (
      <div className="container mx-auto flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen py-12">
      <PageHeader
        title="Registrati"
        description="Crea un nuovo account per iniziare."
      />
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle>Registrazione</CardTitle>
          <CardDescription>Inserisci i tuoi dati per creare un account.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tuamail@esempio.com"
                        {...field}
                        disabled={isLoading || isGoogleLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading || isGoogleLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="confirmPassword">Conferma Password</FormLabel>
                    <FormControl>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading || isGoogleLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-4">
              <Button type="submit" disabled={isLoading || isGoogleLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrazione in corso...
                  </>
                ) : (
                  "Registrati"
                )}
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Oppure continua con
                  </span>
                </div>
              </div>

              <Button variant="outline" type="button" disabled={isLoading || isGoogleLoading} onClick={handleGoogleSignUp} className="w-full">
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Registrati con Google
              </Button>

              <p className="text-center text-sm text-muted-foreground pt-2">
                Hai già un account?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Accedi qui
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
