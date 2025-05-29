import { PageHeader } from "@/components/shared/page-header";
import { ContentExpanderForm } from "@/components/forms/content-expander-form";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Content Expander | " + siteConfig.name,
  description: "Expand text snippets into detailed blog post sections.",
};

export default function ContentExpanderPage() {
  return (
    <div className="container mx-auto">
      <PageHeader
        title="Content Expander"
        description="Turn brief ideas or outlines into well-developed blog sections. Input your snippet, and let AI elaborate with engaging and informative content."
      />
      <div className="flex justify-center">
        <ContentExpanderForm />
      </div>
    </div>
  );
}
