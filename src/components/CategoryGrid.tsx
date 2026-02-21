"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/types";
import CategoryCard from "./CategoryCard";
import { createClient } from "@/lib/supabase/client";

export default function CategoryGrid() {
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [allowedCategories, setAllowedCategories] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // Get current user's profile
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role, allowed_categories")
          .eq("id", user.id)
          .single();

        if (profile) {
          // Admins and sub_admins see everything on the main site
          if (profile.role === "admin" || profile.role === "sub_admin") {
            setAllowedCategories(null); // null = no filter
          } else if (profile.allowed_categories === "all") {
            setAllowedCategories(null);
          } else if (profile.allowed_categories) {
            setAllowedCategories(
              profile.allowed_categories.split(",").filter(Boolean)
            );
          } else {
            setAllowedCategories([]); // No categories assigned = see nothing
          }
        }
      }

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

  // Filter by user's allowed categories (if set)
  if (allowedCategories !== null) {
    categoriesToShow = categoriesToShow.filter(c => allowedCategories.includes(c));
  }

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
