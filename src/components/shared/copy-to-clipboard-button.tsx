"use client";

import * as React from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CopyToClipboardButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  textToCopy: string;
  disabled?: boolean;
}

export function CopyToClipboardButton({
  textToCopy,
  className,
  disabled,
  ...props
}: CopyToClipboardButtonProps) {
  const [isCopied, setIsCopied] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const copyText = async () => {
    if (isCopied || !textToCopy) return;

    setIsLoading(true);
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "The content has been copied successfully.",
      });
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error("Failed to copy text: ", error);
      toast({
        title: "Error copying",
        description: "Could not copy content to clipboard.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={copyText}
      disabled={disabled || isLoading || !textToCopy}
      {...props}
      aria-label="Copy to clipboard"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isCopied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
