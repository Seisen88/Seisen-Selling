"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    async function getProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setAuthEmail(user.email || null);
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      } else {
        setAuthEmail(null);
        setProfile(null);
      }
      setLoading(false);
    }

    getProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setProfile(null);
        setAuthEmail(null);
      } else {
        getProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    router.push("/login");
  };

  if (isLoginPage) return null;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#08080f]/80 border-b border-[#2a2a4a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent hover:from-purple-300 hover:to-purple-500 transition-all"
          >
            Seisen Premium
          </Link>

          <div className="flex items-center gap-4">
            {!loading && (
              <>
                {profile?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="bg-purple-600/20 text-purple-300 border border-purple-500/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600/30 hover:border-purple-500/50 transition-all"
                  >
                    Admin Panel
                  </Link>
                )}

                {(profile || authEmail) ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">
                      {profile?.email || authEmail}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-red-400 hover:text-red-300 font-medium cursor-pointer transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
