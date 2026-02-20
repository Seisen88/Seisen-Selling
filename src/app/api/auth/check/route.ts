import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  console.log("Checking email:", email);
  try {
    // Check if the email exists in users
    const { data: profile, error: profileError } = await adminClient
      .from("users")
      .select("role")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    if (!profile) {
      console.log("Profile not found for email:", email);
      return NextResponse.json(
        { error: "This email is not registered. Contact an admin." },
        { status: 404 }
      );
    }

    console.log("Profile found:", profile);

    // If admin, just tell the client to show password field
    if (profile.role === "admin") {
      return NextResponse.json({ isAdmin: true });
    }
  } catch (err) {
    console.error("Auth check internal error:", err);
    return NextResponse.json(
      { error: "Internal server error during auth check" },
      { status: 500 }
    );
  }

  // If regular user, generate a magic link and exchange it for a session
  const { data: linkData, error: linkError } =
    await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email: email.toLowerCase().trim(),
    });

  if (linkError || !linkData) {
    return NextResponse.json(
      { error: linkError?.message || "Failed to generate login" },
      { status: 500 }
    );
  }

  // Exchange the OTP token for a session using the server client
  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email: email.toLowerCase().trim(),
    token: linkData.properties.email_otp,
    type: "email",
  });

  if (verifyError) {
    return NextResponse.json(
      { error: verifyError.message },
      { status: 500 }
    );
  }

  // Session cookies are now set by the server client
  return NextResponse.json({ success: true, isAdmin: false });
}
