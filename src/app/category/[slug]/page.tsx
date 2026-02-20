import { notFound } from "next/navigation";
import { slugToCategory } from "@/lib/types";
import CategoryContent from "@/components/CategoryContent";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = slugToCategory(slug);

  if (!category) {
    notFound();
  }

  return <CategoryContent category={category} />;
}
