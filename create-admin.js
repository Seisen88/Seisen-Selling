
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createAdmin() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const newAdminEmail = 'admin2@fileselling.com';
  const newAdminPassword = 'Admin2Password123!';

  console.log(`Creating admin account for ${newAdminEmail}...`);

  // 1. Create the user in Supabase Auth
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: newAdminEmail,
    password: newAdminPassword,
    email_confirm: true
  });

  if (authError) {
    console.error('Error creating auth user:', authError.message);
    if (authError.message.includes('already registered')) {
        console.log("User already exists in auth. Proceeding to check/update public table...");
        // If user exists, we might need to find their ID
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const user = existingUsers.users.find(u => u.email === newAdminEmail);
        if (user) {
            await updatePublicUser(supabase, user.id, newAdminEmail, newAdminPassword);
        }
    }
    return;
  }

  console.log('Auth user created successfully:', authUser.user.id);

  // 2. Create the record in the public users table
  await updatePublicUser(supabase, authUser.user.id, newAdminEmail, newAdminPassword);
}

async function updatePublicUser(supabase, id, email, password) {
  const { error: dbError } = await supabase
    .from('users')
    .upsert({
      id: id,
      email: email,
      role: 'admin',
      password: password, // As per your schema
      allowed_categories: 'Windows,Adobe,Krisp,Utilities,Others,Games,Microsoft Office'
    });

  if (dbError) {
    console.error('Error creating public user record:', dbError.message);
  } else {
    console.log('Public user record created/updated successfully with admin role.');
    console.log(`\nEmail: ${email}`);
    console.log(`Password: ${password}`);
  }
}

createAdmin();
