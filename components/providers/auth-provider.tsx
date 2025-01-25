"use client";

import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/lib/store/auth-store";

const supabase = createClient();

supabase.auth.getUser().then(({ data: { user } }) => {
  useAuthStore.setState({ user, isLoading: false });
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({ user: session?.user ?? null });
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
