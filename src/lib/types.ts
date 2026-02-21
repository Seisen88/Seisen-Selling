export type UserRole = "user" | "admin" | "sub_admin";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  allowed_categories?: string | null;
  can_delete?: boolean;
}

export interface Bundle {
  id: string;
  file_name: string;
  category: string;
  description: string | null;
  upload_date: string;
  updated_at: string;
  is_bundle: boolean;
  files?: FileRecord[];
}

export interface FileRecord {
  id: string;
  file_name: string;
  storage_url?: string;
  file_size: string;
  category: string;
  parent_id: string | null;
  description: string | null;
  genre?: string | null;
  thumbnail_url: string | null;
  upload_date: string;
  updated_at: string;
  is_bundle: boolean;
  uploaded_by?: string;
  download_count?: number;
  status?: "active" | "old" | string;
}

export const CATEGORIES = [
  "Windows",
  "Adobe",
  "Krisp",
  "Utilities",
  "Others",
  "Games",
  "Microsoft Office",
  "Engineering Software",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_SLUGS: Record<string, string> = {
  windows: "Windows",
  adobe: "Adobe",
  krisp: "Krisp",
  utilities: "Utilities",
  others: "Others",
  games: "Games",
  "microsoft-office": "Microsoft Office",
  "engineering-software": "Engineering Software",
};

export const CATEGORY_ICONS: Record<string, string> = {
  Windows: "W",
  Adobe: "A",
  Krisp: "K",
  Utilities: "U",
  Others: "O",
  Games: "G",
  "Microsoft Office": "M",
  "Engineering Software": "E",
};

export function categoryToSlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

export function slugToCategory(slug: string): string | undefined {
  return CATEGORY_SLUGS[slug];
}
