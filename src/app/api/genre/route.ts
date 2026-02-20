import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    // Strip common suffixes that break search (e.g. "Ultimate Edition", "Premium Edition")
    const cleanQuery = q
      .replace(/-?\s*(?:Deluxe|Premium|Ultimate|Special|Standard|Gold|GOTY|Definitive|Enhanced|Director'?s\sCut|Complete|Anniversary|Digital)\s+Edition/gi, "")
      .replace(/-?\s*(?:Update\s+v?\d[\d.]*)/gi, "")
      .replace(/-?\s*v\d[\d.]*/gi, "") // Remove version numbers
      .trim();

    // Steam Store search API (unauthenticated):
    const steamRes = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(
        cleanQuery
      )}&l=english&cc=US`
    );
    const steamData = await steamRes.json();

    if (steamData.items && steamData.items.length > 0) {
      const appId = steamData.items[0].id;
      // Get app details to get genres
      const detailsRes = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${appId}`
      );
      const detailsData = await detailsRes.json();
      
      if (detailsData[appId]?.success && detailsData[appId].data?.genres) {
        const genres = detailsData[appId].data.genres
          .map((g: any) => g.description)
          .slice(0, 2) // Take top 2 genres max
          .join(", ");
          
        return NextResponse.json({ genre: genres });
      }
    }

    // Fallback if not found on Steam
    return NextResponse.json({ error: "Game not found or no genres available" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
