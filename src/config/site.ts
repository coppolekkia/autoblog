import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, TextCursorInput, FileText, MessageSquareQuote, Bot } from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
};

export type SiteConfig = {
  name: string;
  description: string;
  url: string; // Replace with your actual URL in production
  ogImage: string; // Replace with your actual OG image URL
  mainNav: NavItem[];
};

export const siteConfig: SiteConfig = {
  name: "AutoContentAI",
  description: "AI-powered content generation for your auto blog.",
  url: "http://localhost:3000", // Example URL
  ogImage: "https://placehold.co/1200x630.png", // Example OG image
  mainNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Title Generator",
      href: "/title-generator",
      icon: TextCursorInput,
    },
    {
      title: "Meta Description",
      href: "/meta-description",
      icon: FileText,
    },
    {
      title: "Content Expander",
      href: "/content-expander",
      icon: MessageSquareQuote,
    },
  ],
};
