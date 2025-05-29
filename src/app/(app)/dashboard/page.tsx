import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const tools = siteConfig.mainNav.filter(item => item.href !== "/dashboard");

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Welcome to AutoContentAI"
        description="Your AI-powered assistant for creating amazing automotive blog content. Get started by selecting a tool below."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.href} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <tool.icon className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">{tool.title}</CardTitle>
              </div>
              <CardDescription>
                {tool.title === "Title Generator" && "Generate engaging blog post titles based on keywords."}
                {tool.title === "Meta Description" && "Craft concise meta descriptions to boost SEO."}
                {tool.title === "Content Expander" && "Expand text snippets into detailed blog sections."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
              <Button asChild className="mt-auto w-full">
                <Link href={tool.href}>
                  Go to {tool.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
       <Card className="mt-8 bg-secondary/50 shadow-lg">
        <CardHeader>
          <CardTitle>About AutoContentAI</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            AutoContentAI leverages powerful Gemini AI models to help you streamline your content creation process.
            Whether you need catchy titles, SEO-friendly meta descriptions, or fully developed blog sections,
            our tools are designed to save you time and enhance your creativity.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
