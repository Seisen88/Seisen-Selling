"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/types";
import CategoryCard from "./CategoryCard";
import { createClient } from "@/lib/supabase/client";

export default function CategoryGrid() {
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // Get categories that have files
      const { data, error } = await supabase
        .from("files")
        .select("category");

      if (!error && data) {
        const uniqueCategories = Array.from(new Set(data.map(f => f.category)));
        setActiveCategories(uniqueCategories);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  let categoriesToShow = CATEGORIES.filter(c => activeCategories.includes(c));

  if (categoriesToShow.length === 0) {
    return (
      <div className="text-center py-20 bg-[#161616] rounded-2xl border border-dashed border-[#2a2a2a]">
        <p className="text-gray-500">No content available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
      {categoriesToShow.map((category) => (
        <CategoryCard key={category} category={category} />
      ))}
    </div>
  );
}
