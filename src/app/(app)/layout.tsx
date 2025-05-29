
// app/(app)/layout.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { siteConfig } from "@/config/site";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth-context";
import { LogIn, LogOut, UserPlus, UserCircle, Loader2 } from "lucide-react"; // Aggiunto Loader2
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { currentUser, signOut, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout Effettuato",
        description: "Sei stato disconnesso con successo.",
      });
      router.push("/login");
    } catch (error) {
      console.error("Errore durante il logout:", error);
      toast({
        title: "Errore Logout",
        description: "Impossibile effettuare il logout. Riprova.",
        variant: "destructive",
      });
    }
  };

  const getAvatarFallback = (email?: string | null) => {
    if (!email) return "Ut";
    return email.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  // Se non c'è utente (e il login è solo per admin), non dovrebbe arrivare qui,
  // ma gestiamo il caso per sicurezza o per vecchi utenti non-admin.
  // L'admin viene reindirizzato a / dalla logica in (app)/page.tsx, quindi non vedrà questo layout.
  // Questo layout sarà quindi principalmente per gli strumenti accessibili dall'admin.

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="p-4">
            <Link href="/" className="flex items-center gap-2"> {/* Link alla homepage admin */}
              <Icons.AppLogo className="h-8 w-8 text-primary" />
              <span className="text-lg font-semibold text-foreground group-data-[collapsible=icon]:hidden">
                {siteConfig.name}
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent asChild>
            <ScrollArea className="h-full">
              <SidebarMenu className="p-4 pt-0">
                {siteConfig.mainNav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                      tooltip={{ children: item.title, className: "group-data-[collapsible=icon]:flex hidden" }}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarContent>
           <SidebarFooter className="p-4 mt-auto border-t">
            {currentUser ? ( // Questo sarà sempre l'admin se la logica funziona
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
                    <Avatar className="h-8 w-8 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6">
                      <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.email || "Admin"} />
                      <AvatarFallback>{getAvatarFallback(currentUser.email)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-2 text-left group-data-[collapsible=icon]:hidden">
                      <p className="text-sm font-medium truncate">{currentUser.email}</p>
                      <p className="text-xs text-muted-foreground">Amministratore</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56">
                  <DropdownMenuLabel>Account Amministratore</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Questo blocco non dovrebbe essere raggiunto se il login è solo per admin
              // e l'accesso a (app) richiede autenticazione.
              <div className="flex flex-col gap-2 group-data-[collapsible=icon]:items-center">
                <Button asChild variant="default" className="w-full group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0">
                  <Link href="/login">
                    <LogIn className="h-5 w-5 group-data-[collapsible=icon]:m-auto" />
                    <span className="group-data-[collapsible=icon]:hidden ml-2">Login</span>
                  </Link>
                </Button>
                {/* Pulsante Registrati rimosso dalla sidebar */}
              </div>
            )}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            {currentUser && ( // Sarà l'admin
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.email || "Admin"} />
                        <AvatarFallback>{getAvatarFallback(currentUser.email)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{currentUser.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
