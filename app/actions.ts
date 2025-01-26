"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required"
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link."
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/dashboard/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/dashboard/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export async function createGoalAction(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();

  if (!title) {
    return encodedRedirect("error", "/dashboard", "Title is required");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return encodedRedirect("error", "/sign-in", "You must be signed in");
  }

  const { error } = await supabase.from("goals").insert({
    title,
    description,
    user_id: user.id,
  });

  if (error) {
    console.error(error);
    return encodedRedirect("error", "/dashboard", "Failed to create goal");
  }

  return encodedRedirect("success", "/dashboard", "Goal created successfully");
}

export async function toggleGoalAction(formData: FormData) {
  const supabase = await createClient();
  const completed = formData.get("completed") === "on";
  const goalId = formData.get("goalId")?.toString();

  if (!goalId) {
    return encodedRedirect("error", "/dashboard", "Goal ID is required");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return encodedRedirect("error", "/sign-in", "You must be signed in");
  }

  const { error } = await supabase
    .from("goals")
    .update({ completed })
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    return encodedRedirect("error", "/dashboard", "Failed to update goal");
  }
}

export async function editGoalAction(formData: FormData) {
  const supabase = await createClient();
  const goalId = formData.get("goalId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  // Check if the goal is completed
  const { data: goal } = await supabase
    .from("goals")
    .select("completed")
    .eq("id", goalId)
    .single();

  if (goal?.completed) {
    throw new Error("Cannot edit completed goals");
  }

  const { error } = await supabase
    .from("goals")
    .update({ title, description })
    .eq("id", goalId);

  if (error) {
    throw error;
  }
}

export async function removeGoalAction(formData: FormData) {
  const supabase = await createClient();
  const goalId = formData.get("goalId") as string;

  // Check if the goal is completed
  const { data: goal } = await supabase
    .from("goals")
    .select("completed")
    .eq("id", goalId)
    .single();

  if (goal?.completed) {
    throw new Error("Cannot delete completed goals");
  }

  const { error } = await supabase.from("goals").delete().eq("id", goalId);

  if (error) {
    throw error;
  }
}
