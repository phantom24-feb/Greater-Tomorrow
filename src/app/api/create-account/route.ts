import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { admissionNo, dateOfBirth, loginMethod, loginValue, password } =
    await request.json();

  if (
    !admissionNo ||
    !dateOfBirth ||
    !loginMethod ||
    !loginValue ||
    !password
  ) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 },
    );
  }

  if (loginMethod !== "email" && loginMethod !== "phone") {
    return NextResponse.json(
      { error: "Invalid login method." },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  // 1. Find a matching student record (service role bypasses RLS here,
  //    which is required since this request has no logged-in user yet).
  const { data: student, error: lookupError } = await supabase
    .from("students")
    .select("id, user_id, admission_no, date_of_birth, status")
    .eq("admission_no", admissionNo)
    .single();

  if (lookupError || !student) {
    return NextResponse.json(
      { error: "No matching student record found." },
      { status: 404 },
    );
  }

  if (student.date_of_birth !== dateOfBirth) {
    return NextResponse.json(
      { error: "Details do not match our records." },
      { status: 400 },
    );
  }

  if (student.user_id) {
    return NextResponse.json(
      {
        error:
          "An account already exists for this admission number. Try logging in instead.",
      },
      { status: 409 },
    );
  }

  if (student.status !== "active") {
    return NextResponse.json(
      { error: "This record is not active. Please contact the school office." },
      { status: 403 },
    );
  }

  // 2. Create the auth user with the student's chosen email or phone number.
  const { data: newUser, error: createError } =
    loginMethod === "email"
      ? await supabase.auth.admin.createUser({
          email: loginValue,
          password,
          email_confirm: true,
        })
      : await supabase.auth.admin.createUser({
          phone: loginValue,
          password,
          phone_confirm: true,
        });

  if (createError || !newUser.user) {
    const message = createError?.message?.toLowerCase().includes("registered")
      ? "That email or phone number is already in use."
      : "Could not create account. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // 3. Link the new auth user back to the student record and save
  //    the email/phone they chose to log in with.
  const { error: linkError } = await supabase
    .from("students")
    .update({
      user_id: newUser.user.id,
      ...(loginMethod === "email"
        ? { email: loginValue }
        : { phone: loginValue }),
    })
    .eq("id", student.id);

  if (linkError) {
    // Roll back the created auth user so it isn't left orphaned.
    await supabase.auth.admin.deleteUser(newUser.user.id);
    return NextResponse.json(
      { error: "Could not link account. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
