"use client";

import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateMetaDescription, type GenerateMetaDescriptionOutput } from "@/ai/flows/generate-meta-description";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { CopyToClipboardButton } from "@/components/shared/copy-to-clipboard-button";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters long." }).max(150),
  keywords: z.string().min(3, { message: "Keywords must be at least 3 characters long." }).max(100),
});

type MetaDescriptionFormValues = z.infer<typeof formSchema>;

export function MetaDescriptionForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedDescription, setGeneratedDescription] = React.useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<MetaDescriptionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      keywords: "",
    },
  });

  const onSubmit: SubmitHandler<MetaDescriptionFormValues> = async (data) => {
    setIsLoading(true);
    setGeneratedDescription(null);
    try {
      const result: GenerateMetaDescriptionOutput = await generateMetaDescription({ title: data.title, keywords: data.keywords });
      setGeneratedDescription(result.metaDescription);
      toast({
        title: "Meta Description Generated!",
        description: "A new meta description has been successfully generated.",
      });
    } catch (error) {
      console.error("Error generating meta description:", error);
      toast({
        title: "Error Generating Meta Description",
        description: (error as Error).message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl shadow-xl">
      <CardHeader>
        <CardTitle>Meta Description Creator</CardTitle>
        <CardDescription>Enter a blog post title and keywords to generate an SEO-friendly meta description.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="title">Blog Post Title</FormLabel>
                  <FormControl>
                    <Input
                      id="title"
                      placeholder="e.g., The Future of Autonomous Driving Technology"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="keywords">Keywords</FormLabel>
                  <FormControl>
                    <Input
                      id="keywords"
                      placeholder="e.g., self-driving cars, AI, automotive innovation"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Meta Description"
              )}
            </Button>
            {generatedDescription && (
              <Card className="bg-secondary/50 p-4">
                <Label className="text-sm font-medium text-muted-foreground">Generated Meta Description:</Label>
                <div className="mt-2 flex items-start justify-between gap-2 rounded-md border bg-background p-3 shadow-sm">
                  <Textarea
                    readOnly
                    value={generatedDescription}
                    className="h-auto min-h-[60px] flex-grow resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                    rows={3}
                  />
                  <CopyToClipboardButton textToCopy={generatedDescription} className="mt-1" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Length: {generatedDescription.length} characters
                </p>
              </Card>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
