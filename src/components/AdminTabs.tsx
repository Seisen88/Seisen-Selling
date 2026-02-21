"use client";

import { useState } from "react";
import FilesTab from "./FilesTab";
import GamesTab from "./GamesTab";
import AddFileTab from "./AddFileTab";
import UsersTab from "./UsersTab";

const TABS = [
  { id: "files", label: "Files", icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>) },
  { id: "games", label: "Games", icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>) },
  { id: "add", label: "Add File", icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>) },
  { id: "users", label: "Users", icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>) },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("files");

  return (
    <div>
      <div className="flex border-b border-[#2a2a2a] mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "border-white text-white"
                : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "files" && <FilesTab />}
      {activeTab === "games" && <GamesTab />}
      {activeTab === "add" && <AddFileTab />}
      {activeTab === "users" && <UsersTab />}
    </div>
  );
}
