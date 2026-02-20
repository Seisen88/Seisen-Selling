"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Bundle } from "@/lib/types";
import { CATEGORY_ICONS } from "@/lib/types";
import SearchBar from "./SearchBar";
import BundleForm from "./BundleForm";

export default function BundlesTab() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchBundles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("files")
      .select("*")
      .eq("is_bundle", true)
      .order("file_name");
    setBundles(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this bundle? Files inside will become standalone."))
      return;
    // Unlink files first
    await supabase
      .from("files")
      .update({ parent_id: null })
      .eq("parent_id", id);
    await supabase.from("files").delete().eq("id", id);
    fetchBundles();
  };

  const filtered = bundles.filter(
    (b) =>
      b.file_name.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase()) ||
      b.description?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Bundle[]>>((acc, bundle) => {
    if (!acc[bundle.category]) acc[bundle.category] = [];
    acc[bundle.category].push(bundle);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <SearchBar onSearch={setSearch} placeholder="Search bundles..." />
        </div>
        <button
          onClick={() => {
            setEditingBundle(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
        >
          + Add Bundle
        </button>
      </div>

      {(showForm || editingBundle) && (
        <BundleForm
          bundle={editingBundle}
          onSaved={() => {
            setShowForm(false);
            setEditingBundle(null);
            fetchBundles();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingBundle(null);
          }}
        />
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-gray-500 text-center py-8">No bundles found.</p>
      ) : (
        Object.entries(grouped).map(([cat, catBundles]) => (
          <div key={cat}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>{CATEGORY_ICONS[cat] || "📁"}</span>
              {cat} ({catBundles.length})
            </h3>
            <div className="space-y-2 mb-6">
              {catBundles.map((bundle) => (
                <div
                  key={bundle.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 flex items-center justify-between gap-4">
                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === bundle.id ? null : bundle.id
                        )
                      }
                      className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <span className="text-lg">📦</span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {bundle.file_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {bundle.files?.length || 0} files
                          {bundle.description && ` · ${bundle.description}`}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditingBundle(bundle);
                          setShowForm(false);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(bundle.id)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {expandedId === bundle.id &&
                    bundle.files &&
                    bundle.files.length > 0 && (
                      <div className="border-t border-gray-100 bg-gray-50 p-3 space-y-1">
                        {bundle.files.map((file) => (
                          <div
                            key={file.id}
                            className="text-sm text-gray-700 flex items-center gap-2 py-1 px-2"
                          >
                            <span className="text-gray-400">📄</span>
                            <span className="truncate">{file.file_name}</span>
                            <span className="text-xs text-gray-400 ml-auto">
                              {file.file_size}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
