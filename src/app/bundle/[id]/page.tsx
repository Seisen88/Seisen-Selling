import BundleContent from "@/components/BundleContent";

export default async function BundlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BundleContent bundleId={id} />;
}
