// Run this script to add the allowed_categories column to the users table.
// Usage: node add-allowed-categories.js

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // Try to add the column. If it already exists, this will fail gracefully.
  const { error } = await supabase.rpc("exec_sql", {
    sql: "ALTER TABLE users ADD COLUMN IF NOT EXISTS allowed_categories text DEFAULT NULL;"
  });

  if (error) {
    // If RPC doesn't exist, try a workaround: update a test row
    console.log("RPC not available, trying direct update approach...");

    // Test if column exists by trying to select it
    const { data, error: selectError } = await supabase
      .from("users")
      .select("allowed_categories")
      .limit(1);

    if (selectError) {
      console.log("Column does NOT exist yet.");
      console.log("Please run this SQL in your Supabase Dashboard > SQL Editor:");
      console.log("");
      console.log("  ALTER TABLE users ADD COLUMN allowed_categories text DEFAULT NULL;");
      console.log("");
    } else {
      console.log("Column already exists! Current data:", data);
    }
  } else {
    console.log("Column added successfully!");
  }
}

main();
