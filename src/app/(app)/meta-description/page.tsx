import { PageHeader } from "@/components/shared/page-header";
import { MetaDescriptionForm } from "@/components/forms/meta-description-form";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Meta Description Creator | " + siteConfig.name,
  description: "Craft SEO-friendly meta descriptions for your blog posts.",
};

export default function MetaDescriptionPage() {
  return (
    <div className="container mx-auto">
      <PageHeader
        title="Meta Description Creator"
        description="Boost your blog's visibility on search engines. Provide a title and keywords, and AI will generate a concise and compelling meta description (max 160 characters)."
      />
      <div className="flex justify-center">
        <MetaDescriptionForm />
      </div>
    </div>
  );
}
