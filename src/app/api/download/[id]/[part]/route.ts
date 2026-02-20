import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; part: string }> }
) {
  const { id, part } = await params;
  const partIndex = parseInt(part, 10);

  if (!id || isNaN(partIndex)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: file, error } = await supabase
    .from("files")
    .select("storage_url")
    .eq("id", id)
    .single();

  if (error || !file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const urls = file.storage_url
    ? file.storage_url.split("\n").filter((u: string) => u.trim())
    : [];

  if (partIndex < 0 || partIndex >= urls.length) {
    return NextResponse.json({ error: "Part not found" }, { status: 404 });
  }

  return NextResponse.redirect(urls[partIndex].trim());
}
