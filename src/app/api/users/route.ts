import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  // Verify the requester is an admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden - only head admins can add users" }, { status: 403 });
  }

  const { email, role, password } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Validate role
  const validRoles = ["user", "admin", "sub_admin"];
  if (role && !validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // Try to create user in auth
  const userPassword = password || crypto.randomUUID();
  const { data: newUser, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password: userPassword,
      email_confirm: true,
    });

  let userId: string;

  if (createError) {
    // If user already exists in auth, find them and re-add to users table
    if (createError.message.includes("already been registered")) {
      const { data: listData } = await adminClient.auth.admin.listUsers();
      const existing = listData?.users?.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );
      if (!existing) {
        return NextResponse.json(
          { error: "User exists in auth but could not be found" },
          { status: 400 }
        );
      }
      userId = existing.id;
    } else {
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }
  } else {
    userId = newUser.user.id;
  }

  // Upsert user in users table
  const { error: profileError } = await adminClient
    .from("users")
    .upsert({
      id: userId,
      email,
      role: role || "user",
      allowed_categories: "Utilities",
    });

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, userId });
}

export async function DELETE(request: NextRequest) {
  // Verify the requester is a head admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden - only head admins can delete users" }, { status: 403 });
  }

  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  // Don't allow deleting yourself
  if (userId === user.id) {
    return NextResponse.json(
      { error: "Cannot delete your own account" },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();

  // Delete user record first
  await adminClient.from("users").delete().eq("id", userId);

  // Delete auth user
  const { error: deleteError } =
    await adminClient.auth.admin.deleteUser(userId);

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
