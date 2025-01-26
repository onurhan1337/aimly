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
  const { error } = await supabase.auth.signOut();

  if (error) {
    return encodedRedirect("error", "/dashboard", "Failed to sign out");
  }

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

export async function getSuggestionsAction() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: existingSuggestions } = await supabase
      .from("suggestions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(4);

    if (existingSuggestions && existingSuggestions.length === 4) {
      return { suggestions: existingSuggestions };
    }

    const { data: pastGoals } = await supabase
      .from("goals")
      .select("title, description, completed")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const goalsForAnalysis = pastGoals?.length
      ? pastGoals
      : [
          {
            title: "Read a book",
            description: "Read for personal development",
            completed: true,
          },
          {
            title: "Exercise",
            description: "30 minutes of physical activity",
            completed: true,
          },
          {
            title: "Learn coding",
            description: "Practice programming skills",
            completed: true,
          },
        ];

    const prompt = `As an AI goal suggestion assistant, analyze these past goals and suggest 4 new achievable daily goals. Past goals: ${JSON.stringify(goalsForAnalysis)}

Focus on:
1. Similar themes to completed goals
2. Gradually increasing difficulty
3. Mix of different goal types (health, productivity, personal growth)
4. Specific, measurable goals

Return your response in this exact JSON format:
{
  "suggestions": [
    {
      "title": "string",
      "description": "string"
    }
  ]
}`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI assistant that suggests personalized daily goals based on user's past goals and preferences. Always respond in valid JSON format with exactly 4 suggestions.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Groq API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error("Failed to generate suggestions");
    }

    const data = await response.json();
    let suggestions;

    try {
      const parsedContent = JSON.parse(data.choices[0].message.content);
      if (
        parsedContent.suggestions &&
        Array.isArray(parsedContent.suggestions)
      ) {
        suggestions = parsedContent;

        // Delete existing suggestions
        await supabase.from("suggestions").delete().eq("user_id", user.id);

        // Store new suggestions
        const { error: insertError } = await supabase
          .from("suggestions")
          .insert(
            parsedContent.suggestions.map((s: any) => ({
              title: s.title,
              description: s.description,
              user_id: user.id,
            }))
          );

        if (insertError) {
          console.error("Failed to store suggestions:", insertError);
        }
      } else {
        throw new Error("Invalid response format from AI");
      }
    } catch (e) {
      console.error("JSON Parse Error:", e);
      suggestions = {
        suggestions: [
          {
            title: "Take a 15-minute walk",
            description:
              "Start your day with a refreshing walk to boost energy and mental clarity",
          },
          {
            title: "Read 10 pages",
            description:
              "Dedicate time to reading to expand knowledge and maintain focus",
          },
          {
            title: "Practice mindfulness",
            description:
              "Spend 5 minutes on meditation or deep breathing exercises",
          },
          {
            title: "Learn something new",
            description:
              "Spend 20 minutes learning a new skill or topic of interest",
          },
        ],
      };

      // Store fallback suggestions
      await supabase.from("suggestions").delete().eq("user_id", user.id);

      await supabase.from("suggestions").insert(
        suggestions.suggestions.map((s) => ({
          title: s.title,
          description: s.description,
          user_id: user.id,
        }))
      );
    }

    return suggestions;
  } catch (error) {
    console.error("Get Suggestions Error:", error);
    throw error;
  }
}

export async function addSuggestionAsGoalAction(suggestion: {
  title: string;
  description: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in");
  }

  const today = new Date().toISOString().split("T")[0];

  const { error } = await supabase.from("goals").insert({
    title: suggestion.title,
    description: suggestion.description,
    user_id: user.id,
    target_date: today,
  });

  if (error) {
    console.error(error);
    throw new Error("Failed to create goal");
  }
}

export async function toggleFavoriteSuggestionAction(suggestionId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in");
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorite_suggestions")
    .select("id")
    .eq("user_id", user.id)
    .eq("suggestion_id", suggestionId)
    .single();

  if (existing) {
    // Remove from favorites
    const { error } = await supabase
      .from("favorite_suggestions")
      .delete()
      .eq("user_id", user.id)
      .eq("suggestion_id", suggestionId);

    if (error) throw error;
  } else {
    // Add to favorites
    const { error } = await supabase.from("favorite_suggestions").insert({
      user_id: user.id,
      suggestion_id: suggestionId,
    });

    if (error) throw error;
  }
}

export async function getFavoriteSuggestionsAction() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in");
  }

  const { data, error } = await supabase
    .from("suggestions")
    .select("*, favorite_suggestions!inner(*)")
    .eq("favorite_suggestions.user_id", user.id);

  if (error) throw error;

  return data;
}

export async function refreshSuggestionsAction() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Get favorite suggestions first
    const { data: favoriteSuggestions } = await supabase
      .from("suggestions")
      .select("*, favorite_suggestions!inner(*)")
      .eq("favorite_suggestions.user_id", user.id);

    // Delete non-favorite suggestions
    const favoriteIds = (favoriteSuggestions || []).map((s) => s.id);
    const { error: deleteError } = await supabase
      .from("suggestions")
      .delete()
      .eq("user_id", user.id)
      .not("id", "in", favoriteIds.length > 0 ? favoriteIds : [null]);

    if (deleteError) {
      console.error("Failed to delete old suggestions:", deleteError);
      throw new Error("Failed to delete old suggestions");
    }

    // Get active goals for analysis
    const { data: activeGoals } = await supabase
      .from("goals")
      .select("title, description")
      .eq("user_id", user.id)
      .eq("completed", false)
      .order("created_at", { ascending: false })
      .limit(10);

    const goalsForAnalysis = activeGoals?.length
      ? activeGoals
      : [
          {
            title: "Read a book",
            description: "Read for personal development",
          },
          {
            title: "Exercise",
            description: "30 minutes of physical activity",
          },
          {
            title: "Learn coding",
            description: "Practice programming skills",
          },
        ];

    const prompt = `As an AI goal suggestion assistant, analyze these active goals and suggest 4 new achievable daily goals that complement them. Active goals: ${JSON.stringify(goalsForAnalysis)}

Focus on:
1. Complementary goals that support active goals
2. Gradually increasing difficulty
3. Mix of different goal types (health, productivity, personal growth)
4. Specific, measurable goals

Return your response in this exact JSON format:
{
  "suggestions": [
    {
      "title": "string",
      "description": "string"
    }
  ]
}`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI assistant that suggests personalized daily goals based on user's active goals. Always respond in valid JSON format with exactly 4 suggestions.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate suggestions");
    }

    const data = await response.json();
    try {
      const parsedContent = JSON.parse(data.choices[0].message.content);
      if (
        parsedContent.suggestions &&
        Array.isArray(parsedContent.suggestions)
      ) {
        // Insert new suggestions
        const { error: insertError } = await supabase
          .from("suggestions")
          .insert(
            parsedContent.suggestions.map((s: any) => ({
              title: s.title,
              description: s.description,
              user_id: user.id,
            }))
          );

        if (insertError) {
          throw insertError;
        }

        // Get all suggestions (including favorites)
        const { data: allSuggestions } = await supabase
          .from("suggestions")
          .select("*")
          .eq("user_id", user.id);

        return { suggestions: allSuggestions || [] };
      }
    } catch (error) {
      throw new Error("Failed to refresh suggestions");
    }
  } catch (error) {
    console.error("Refresh Suggestions Error:", error);
    throw error;
  }
}

export async function categorizeGoalsAction() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: goals } = await supabase
      .from("goals")
      .select("title, description")
      .eq("user_id", user.id);

    if (!goals || goals.length === 0) {
      return {
        categories: [
          { name: "Health", value: 0 },
          { name: "Career", value: 0 },
          { name: "Personal", value: 0 },
          { name: "Learning", value: 0 },
          { name: "Social", value: 0 },
        ],
      };
    }

    const prompt = `As an AI goal categorization assistant, analyze these goals and categorize them into 5 main categories: Health, Career, Personal, Learning, and Social. Count how many goals fall into each category.

Goals to analyze: ${JSON.stringify(goals)}

Return your response in this exact JSON format:
{
  "categories": [
    {
      "name": "string",
      "value": number
    }
  ]
}

Make sure all 5 categories are included in the response, even if they have 0 goals.`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI assistant that categorizes goals into predefined categories. Always respond in valid JSON format with exactly 5 categories.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to categorize goals");
    }

    const data = await response.json();
    let categories;

    try {
      const parsedContent = JSON.parse(data.choices[0].message.content);
      if (parsedContent.categories && Array.isArray(parsedContent.categories)) {
        categories = parsedContent;
      } else {
        throw new Error("Invalid response format from AI");
      }
    } catch (error) {
      console.error("JSON Parse Error:", error);
      categories = {
        categories: [
          { name: "Health", value: 0 },
          { name: "Career", value: 0 },
          { name: "Personal", value: 0 },
          { name: "Learning", value: 0 },
          { name: "Social", value: 0 },
        ],
      };
    }

    return categories;
  } catch (error) {
    console.error("Categorize Goals Error:", error);
    throw error;
  }
}
