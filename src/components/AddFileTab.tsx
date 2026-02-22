"use client";

import { useState, useEffect } from "react";
import FileForm, { type DraftData } from "./FileForm";

const DRAFTS_KEY = "reiya-file-drafts";

interface DraftItem {
  id: string;
  name: string;
  category: string;
  savedAt: string;
  data: DraftData;
}

interface AddFileTabProps {
  allowedCategories?: string[];
}

export default function AddFileTab({ allowedCategories }: AddFileTabProps) {
  const [success, setSuccess] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [activeView, setActiveView] = useState<"form" | "drafts">("form");
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loadedDraft, setLoadedDraft] = useState<DraftData | null>(null);

  // Determine default category based on allowed categories
  const defaultCategory = allowedCategories && allowedCategories.length > 0
    ? (allowedCategories.includes("Games") ? "Games" : allowedCategories[0])
    : "Games";

  // Load drafts from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFTS_KEY);
      if (raw) setDrafts(JSON.parse(raw));
    } catch {}
  }, []);

  const saveDraftsToStorage = (newDrafts: DraftItem[]) => {
    setDrafts(newDrafts);
    try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(newDrafts)); } catch {}
  };

  const handleSaveAsDraft = (draftData: DraftData) => {
    const newDraft: DraftItem = {
      id: Date.now().toString(),
      name: draftData.name || "Untitled Draft",
      category: draftData.category,
      savedAt: new Date().toISOString(),
      data: draftData,
    };
    saveDraftsToStorage([newDraft, ...drafts]);
    setLoadedDraft(null);
    setFormKey((k) => k + 1);
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoadDraft = (draft: DraftItem) => {
    setLoadedDraft(draft.data);
    setFormKey((k) => k + 1);
    setActiveView("form");
  };

  const handleDeleteDraft = (id: string) => {
    saveDraftsToStorage(drafts.filter((d) => d.id !== id));
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) +
      " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-100">Add New File or Bundle</h2>
          <p className="text-sm text-gray-500">Fill in the details below to add a new item.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveView("form"); setLoadedDraft(null); setFormKey((k) => k + 1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeView === "form"
                ? "bg-white text-black shadow-lg shadow-white/10"
                : "bg-[#1c1c1c] text-gray-400 hover:bg-[#252525] border border-[#2a2a2a]"
            }`}
          >
            Add File
          </button>
          <button
            onClick={() => setActiveView("drafts")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === "drafts"
                ? "bg-white text-black shadow-lg shadow-white/10"
                : "bg-[#1c1c1c] text-gray-400 hover:bg-[#252525] border border-[#2a2a2a]"
            }`}
          >
            Drafts
            {drafts.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeView === "drafts" ? "bg-black/20 text-black" : "bg-amber-500/20 text-amber-400"
              }`}>
                {drafts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl flex justify-between items-center">
          <span>Item added successfully!</span>
          <button
            onClick={() => setSuccess(false)}
            className="text-green-400 hover:text-green-300 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {draftSaved && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-xl flex justify-between items-center">
          <span>Draft saved successfully!</span>
          <button
            onClick={() => setDraftSaved(false)}
            className="text-amber-400 hover:text-amber-300 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {activeView === "form" ? (
        <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-6">
          <FileForm
            key={formKey}
            defaultCategory={defaultCategory}
            allowedCategories={allowedCategories}
            initialDraft={loadedDraft}
            onSaveAsDraft={handleSaveAsDraft}
            onSaved={() => {
              setSuccess(true);
              setLoadedDraft(null);
              setFormKey((k) => k + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onCancel={() => {}}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.length === 0 ? (
            <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-12 text-center">
              <div className="text-gray-600 text-4xl mb-3">📄</div>
              <p className="text-gray-400 font-medium mb-1">No drafts saved yet</p>
              <p className="text-gray-600 text-sm">When you save a draft from the Add File form, it will appear here.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-500">{drafts.length} draft{drafts.length !== 1 ? "s" : ""} saved</p>
                {drafts.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm("Delete all drafts?")) saveDraftsToStorage([]);
                    }}
                    className="text-xs text-red-400/70 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-4 flex items-center justify-between gap-4 hover:border-[#3a3a3a] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-200 font-medium truncate">{draft.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded-lg border border-[#2a2a2a]">
                        {draft.category}
                      </span>
                      <span className="text-xs text-gray-600">{formatDate(draft.savedAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleLoadDraft(draft)}
                      className="bg-white/10 text-gray-300 px-3.5 py-2 rounded-xl text-sm font-medium hover:bg-white/15 transition-colors cursor-pointer border border-white/10"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDeleteDraft(draft.id)}
                      className="bg-red-500/10 text-red-400 px-3.5 py-2 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors cursor-pointer border border-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
