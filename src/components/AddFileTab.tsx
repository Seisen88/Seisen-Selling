"use client";

import { useState } from "react";
import FileForm from "./FileForm";

export default function AddFileTab() {
  const [success, setSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-100">Add New File or Bundle</h2>
        <p className="text-sm text-gray-500">Fill in the details below to add a new item.</p>
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

      <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-6">
        <FileForm
          key={formKey}
          persistDraft
          defaultCategory="Games"
          onSaved={() => {
            setSuccess(true);
            setFormKey((k) => k + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onCancel={() => {}}
        />
      </div>
    </div>
  );
}
