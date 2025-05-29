"use client";

import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateBlogTitle, type GenerateBlogTitleOutput } from "@/ai/flows/generate-blog-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { CopyToClipboardButton } from "@/components/shared/copy-to-clipboard-button";

const formSchema = z.object({
  keywords: z.string().min(3, { message: "Keywords must be at least 3 characters long." }).max(100),
});

type TitleGeneratorFormValues = z.infer<typeof formSchema>;

export function TitleGeneratorForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedTitle, setGeneratedTitle] = React.useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<TitleGeneratorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keywords: "",
    },
  });

  const onSubmit: SubmitHandler<TitleGeneratorFormValues> = async (data) => {
    setIsLoading(true);
    setGeneratedTitle(null);
    try {
      const result: GenerateBlogTitleOutput = await generateBlogTitle({ keywords: data.keywords });
      setGeneratedTitle(result.title);
      toast({
        title: "Title Generated!",
        description: "A new blog title has been successfully generated.",
      });
    } catch (error) {
      console.error("Error generating title:", error);
      toast({
        title: "Error Generating Title",
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
        <CardTitle>Generate Blog Title</CardTitle>
        <CardDescription>Enter keywords to generate an engaging blog post title.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="keywords">Keywords</FormLabel>
                  <FormControl>
                    <Input
                      id="keywords"
                      placeholder="e.g., electric cars, future of driving, AI in vehicles"
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
                "Generate Title"
              )}
            </Button>
            {generatedTitle && (
              <Card className="bg-secondary/50 p-4">
                <Label className="text-sm font-medium text-muted-foreground">Generated Title:</Label>
                <div className="mt-2 flex items-center justify-between gap-2 rounded-md border bg-background p-3 shadow-sm">
                  <p className="text-lg font-semibold text-foreground break-words">{generatedTitle}</p>
                  <CopyToClipboardButton textToCopy={generatedTitle} />
                </div>
              </Card>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
