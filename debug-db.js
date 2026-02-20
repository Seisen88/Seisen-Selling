
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkDb() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("Checking Supabase connection...");
  
  const { data: users, error } = await supabase.from('users').select('*').limit(5);
  
  if (error) {
    console.error("Error querying 'users' table:", error);
  } else {
    console.log("Users table found. Count:", users.length);
    console.log("Sample users:", users);
  }

  const { data: files, error: filesError } = await supabase.from('files').select('*').limit(1);
  if (filesError) {
    console.error("Error querying 'files' table:", filesError);
  } else {
    console.log("Files table found.");
  }
}

checkDb();
