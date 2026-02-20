import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Attempting to add "status" column to files table...');
  const { error } = await supabase.rpc('exec_sql', {
    query: "ALTER TABLE files ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';"
  });

  if (error) {
    console.error('Migration failed via rpc:', error.message);
    console.log('\nCannot execute DDL statements directly via the data API. You will need to run this command in your Supabase SQL Editor manually:');
    console.log('\nALTER TABLE files ADD COLUMN IF NOT EXISTS status text DEFAULT \'active\';\n');
  } else {
    console.log('Migration succeeded!');
  }
}

runMigration();
