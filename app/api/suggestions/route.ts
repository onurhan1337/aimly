import { createClient } from "@/utils/supabase/server";

export const runtime = "edge";

export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    // Get the user's auth session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get user's past goals
    const { data: pastGoals } = await supabase
      .from("goals")
      .select("title, description, completed")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // If no past goals, use some example goals for better suggestions
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
      return new Response(
        JSON.stringify({
          error: "Failed to generate suggestions",
          details: errorData,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    let suggestions;

    try {
      // Parse the content string into JSON
      const parsedContent = JSON.parse(data.choices[0].message.content);
      console.log("Parsed content:", parsedContent); // Debug log

      if (
        parsedContent.suggestions &&
        Array.isArray(parsedContent.suggestions)
      ) {
        suggestions = parsedContent;
      } else {
        throw new Error("Invalid response format from AI");
      }
    } catch (e) {
      console.error("JSON Parse Error:", e);
      // If parsing fails, return a default response
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
    }

    return new Response(JSON.stringify(suggestions), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate suggestions",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
