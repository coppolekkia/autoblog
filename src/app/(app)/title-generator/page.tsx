import { PageHeader } from "@/components/shared/page-header";
import { TitleGeneratorForm } from "@/components/forms/title-generator-form";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Title Generator | " + siteConfig.name,
  description: "Generate engaging blog post titles for your automotive content.",
};

export default function TitleGeneratorPage() {
  return (
    <div className="container mx-auto">
      <PageHeader
        title="Title Generator"
        description="Create captivating headlines for your blog posts. Enter relevant keywords, and let AI craft compelling titles that grab attention and improve click-through rates."
      />
      <div className="flex justify-center">
        <TitleGeneratorForm />
      </div>
    </div>
  );
}
