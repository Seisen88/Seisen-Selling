"use client";

import { useState } from "react";
import FilesTab from "./FilesTab";
import GamesTab from "./GamesTab";
import AddFileTab from "./AddFileTab";
import UsersTab from "./UsersTab";

const TABS = [
  { id: "files", label: "Files", icon: "📄" },
  { id: "games", label: "Games", icon: "🎮" },
  { id: "add", label: "Add File", icon: "➕" },
  { id: "users", label: "Users", icon: "👤" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("files");

  return (
    <div>
      <div className="flex border-b border-[#2a2a4a] mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "border-purple-500 text-purple-400"
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
