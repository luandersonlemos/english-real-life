"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  getEffectivePlan,
  isSupabaseConfigured,
  type PlanId,
} from "@/lib/plans";
import {
  emitProgressSave,
  mergeProgress,
  PROGRESS_SAVE_EVENT,
} from "@/lib/progress-cloud";
import { loadProgress, saveProgress } from "@/lib/progress";
import type { UserProgress } from "@/types";

interface AuthContextValue {
  user: User | null;
  plan: PlanId;
  loading: boolean;
  supabaseEnabled: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  plan: "premium",
  loading: false,
  supabaseEnabled: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabaseEnabled = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<PlanId>("free");
  const [loading, setLoading] = useState(supabaseEnabled);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pullCloudProgress = useCallback(async () => {
    const res = await fetch("/api/progress");
    if (!res.ok) return;
    const data = await res.json();
    if (data.ok && data.progress) {
      const merged = mergeProgress(loadProgress(), data.progress as UserProgress);
      saveProgress(merged);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!supabaseEnabled) return;
    const res = await fetch("/api/plan");
    if (!res.ok) return;
    const data = await res.json();
    if (data.ok && data.plan) {
      setPlan(data.plan as PlanId);
    }
  }, [supabaseEnabled]);

  const pushCloudProgress = useCallback((progress: UserProgress) => {
    if (!user || !supabaseEnabled) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      fetch("/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progress),
      }).catch(() => {});
    }, 800);
  }, [user, supabaseEnabled]);

  useEffect(() => {
    if (!supabaseEnabled) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        await refreshProfile();
        await pullCloudProgress();
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await refreshProfile();
        await pullCloudProgress();
      } else {
        setPlan("free");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabaseEnabled, pullCloudProgress, refreshProfile]);

  useEffect(() => {
    if (!user) return;

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<UserProgress>).detail;
      pushCloudProgress(detail);
    };

    window.addEventListener(PROGRESS_SAVE_EVENT, handler);
    return () => window.removeEventListener(PROGRESS_SAVE_EVENT, handler);
  }, [user, pushCloudProgress]);

  const signOut = useCallback(async () => {
    if (!supabaseEnabled) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setPlan("free");
  }, [supabaseEnabled]);

  const effectivePlan = getEffectivePlan(user ? plan : null, supabaseEnabled);

  const value = useMemo(
    () => ({
      user,
      plan: effectivePlan,
      loading,
      supabaseEnabled,
      signOut,
      refreshProfile,
    }),
    [user, effectivePlan, loading, supabaseEnabled, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
