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
    let channel: ReturnType<typeof supabase.channel> | null = null;

    function applyCategories(role: string, allowed: string | null) {
      if (role === "admin" || role === "sub_admin") {
        setAllowedCategories(null);
      } else if (allowed === "all") {
        setAllowedCategories(null);
      } else if (allowed) {
        setAllowedCategories(allowed.split(",").filter(Boolean));
      } else {
        setAllowedCategories([]);
      }
    }

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
          applyCategories(profile.role, profile.allowed_categories);
        }

        // Subscribe to real-time changes on this user's row
        channel = supabase
          .channel(`user-categories-${user.id}`)
          .on(
            "postgres_changes" as any,
            { event: "UPDATE", schema: "public", table: "users", filter: `id=eq.${user.id}` },
            (payload: any) => {
              const updated = payload.new;
              applyCategories(updated.role, updated.allowed_categories);
            }
          )
          .subscribe();
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

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
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
