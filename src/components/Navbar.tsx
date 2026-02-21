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
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-white hover:text-gray-300 transition-all"
            style={{ fontFamily: "var(--font-japan-ramen), sans-serif" }}
          >
            <img src="/images/reiya.png" alt="Reiya" className="w-9 h-9 object-contain brightness-0 invert" />
            Reiya 零夜
          </Link>

          <div className="flex items-center gap-4">
            {!loading && (
              <>
                {(profile?.role === "admin" || profile?.role === "sub_admin") && (
                  <Link
                    href="/admin"
                    className="bg-white/10 text-gray-300 border border-white/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/15 hover:border-white/30 transition-all"
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
                    className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
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
