"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import SearchBar from "./SearchBar";

export default function UsersTab() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");
  const [newPassword, setNewPassword] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError("");
    setSuccess("");

    const trimmedEmail = newEmail.toLowerCase().trim();

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: trimmedEmail,
        role: newRole,
        ...(newRole === "admin" && newPassword ? { password: newPassword } : {}),
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error || "Failed to add user");
      setAdding(false);
      return;
    }

    setSuccess(`User ${trimmedEmail} added successfully!`);
    setNewEmail("");
    setNewRole("user");
    setNewPassword("");
    setAdding(false);
    fetchUsers();
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}?`)) return;

    const res = await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      const result = await res.json();
      alert(result.error || "Failed to delete user");
      return;
    }

    fetchUsers();
  };

  const getUserCategories = (user: Profile): string[] => {
    if (!user.allowed_categories) return []; // Empty = no access (admin decides)
    if (user.allowed_categories === "all") return [...CATEGORIES];
    return user.allowed_categories.split(",").filter(Boolean);
  };

  const toggleCategory = (user: Profile, category: string) => {
    const current = getUserCategories(user);
    let updated: string[];

    if (current.includes(category)) {
      updated = current.filter((c) => c !== category);
    } else {
      updated = [...current, category];
    }

    // Update local state instantly
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, allowed_categories: updated.length > 0 ? updated.join(",") : null }
          : u
      )
    );
  };

  const handleSelectAll = (user: Profile) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, allowed_categories: "all" }
          : u
      )
    );
  };

  const handleDeselectAll = (user: Profile) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, allowed_categories: null }
          : u
      )
    );
  };

  const saveCategories = async (user: Profile) => {
    setSavingId(user.id);
    const cats = getUserCategories(user);
    const value = cats.length === CATEGORIES.length ? "all" : cats.length > 0 ? cats.join(",") : null;

    await supabase
      .from("users")
      .update({ allowed_categories: value })
      .eq("id", user.id);

    setSavingId(null);
    setEditingId(null);
  };

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Add User Form */}
      <div className="bg-[#161616] rounded-xl border border-[#2a2a2a] p-5">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">
          Add New User
        </h3>
        <form onSubmit={handleAddUser} className="space-y-3">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                placeholder="user@example.com"
                className="w-full px-3 py-2 rounded-xl bg-[#111111] border border-[#2a2a2a] focus:ring-2 focus:ring-white/20 focus:border-transparent outline-none transition text-sm text-gray-200 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "user" | "admin")}
                className="px-3 py-2 rounded-xl bg-[#111111] border border-[#2a2a2a] focus:ring-2 focus:ring-white/20 focus:border-transparent outline-none transition text-sm text-gray-200"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={adding}
              className="bg-white text-black px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-white/10"
            >
              {adding ? "Adding..." : "Add User"}
            </button>
          </div>
          {newRole === "admin" && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Set admin password"
                className="w-full px-3 py-2 rounded-xl bg-[#111111] border border-[#2a2a2a] focus:ring-2 focus:ring-white/20 focus:border-transparent outline-none transition text-sm text-gray-200 placeholder-gray-500"
              />
            </div>
          )}
        </form>

        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm px-4 py-2 rounded-xl border border-red-500/20 mt-3">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 text-green-400 text-sm px-4 py-2 rounded-xl border border-green-500/20 mt-3">
            {success}
          </div>
        )}
      </div>

      <SearchBar onSearch={setSearch} placeholder="Search users..." />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 skeleton rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No users found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => {
            const userCats = getUserCategories(user);
            const isEditing = editingId === user.id;

            return (
              <div key={user.id}>
                <div
                  className={`bg-[#161616] rounded-xl border p-4 flex items-center justify-between gap-4 transition-all ${
                    isEditing
                      ? "border-white/30 rounded-b-none"
                      : "border-[#2a2a2a] hover:border-white/20"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-200 truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-white/10 text-gray-300 border border-white/20"
                            : "bg-[#1c1c1c] text-gray-400 border border-[#2a2a2a]"
                        }`}
                      >
                        {user.role}
                      </span>
                      <span className="text-xs text-gray-500">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </span>
                      {/* Category count indicator */}
                      {user.role !== "admin" && (
                        <span className="text-[10px] text-gray-600">
                          • {user.allowed_categories === "all"
                            ? "All categories"
                            : userCats.length > 0
                            ? `${userCats.length} categories`
                            : "No categories"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {user.role !== "admin" && (
                      <button
                        onClick={() => setEditingId(isEditing ? null : user.id)}
                        className={`text-sm font-medium cursor-pointer transition-colors ${
                          isEditing
                            ? "text-yellow-400 hover:text-yellow-300"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {isEditing ? "Close" : "Categories"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="text-sm text-red-400 hover:text-red-300 font-medium flex-shrink-0 cursor-pointer transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Inline category editor */}
                {isEditing && (
                  <div className="border border-t-0 border-white/30 rounded-b-xl bg-[#111111] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Allowed Categories
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSelectAll(user)}
                          className="text-[10px] text-gray-400 hover:text-white cursor-pointer"
                        >
                          Select All
                        </button>
                        <span className="text-gray-600 text-[10px]">|</span>
                        <button
                          onClick={() => handleDeselectAll(user)}
                          className="text-[10px] text-gray-500 hover:text-gray-400 cursor-pointer"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {CATEGORIES.map((cat) => {
                        const isChecked = userCats.includes(cat);
                        return (
                          <label
                            key={cat}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all border text-sm ${
                              isChecked
                                ? "bg-white/10 border-white/20 text-gray-200"
                                : "bg-[#0c0c0c] border-[#1e1e1e] text-gray-500 hover:border-[#3a3a3a]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCategory(user, cat)}
                              className="accent-white w-3.5 h-3.5"
                            />
                            <span className="text-xs font-medium">{cat}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => saveCategories(user)}
                        disabled={savingId === user.id}
                        className="bg-white text-black px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {savingId === user.id ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
