import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminTabs from "@/components/AdminTabs";

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage files, games, and users
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Site
          </Link>
        </div>

        <AdminTabs />
      </div>
    </>
  );
}
