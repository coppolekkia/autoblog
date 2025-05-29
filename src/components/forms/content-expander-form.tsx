"use client";

import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { expandContent, type ExpandContentOutput } from "@/ai/flows/content-expander";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { CopyToClipboardButton } from "@/components/shared/copy-to-clipboard-button";

const formSchema = z.object({
  textSnippet: z.string().min(10, { message: "Text snippet must be at least 10 characters long." }).max(500),
});

type ContentExpanderFormValues = z.infer<typeof formSchema>;

export function ContentExpanderForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [expandedContent, setExpandedContent] = React.useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ContentExpanderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      textSnippet: "",
    },
  });

  const onSubmit: SubmitHandler<ContentExpanderFormValues> = async (data) => {
    setIsLoading(true);
    setExpandedContent(null);
    try {
      const result: ExpandContentOutput = await expandContent({ textSnippet: data.textSnippet });
      setExpandedContent(result.expandedContent);
      toast({
        title: "Content Expanded!",
        description: "The text snippet has been successfully expanded.",
      });
    } catch (error) {
      console.error("Error expanding content:", error);
      toast({
        title: "Error Expanding Content",
        description: (error as Error).message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <CardHeader>
        <CardTitle>Content Expander</CardTitle>
        <CardDescription>Provide a text snippet or outline, and AI will expand it into a detailed blog post section.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="textSnippet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="textSnippet">Text Snippet / Outline</FormLabel>
                  <FormControl>
                    <Textarea
                      id="textSnippet"
                      placeholder="e.g., Key features of the new Model Z: range, charging speed, autonomous capabilities..."
                      rows={5}
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
                  Expanding...
                </>
              ) : (
                "Expand Content"
              )}
            </Button>
            {expandedContent && (
              <Card className="bg-secondary/50 p-4">
                 <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium text-muted-foreground">Expanded Content:</Label>
                  <CopyToClipboardButton textToCopy={expandedContent} />
                </div>
                <Textarea
                  readOnly
                  value={expandedContent}
                  className="h-auto min-h-[150px] w-full resize-y rounded-md border bg-background p-3 shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                  rows={8}
                />
              </Card>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
