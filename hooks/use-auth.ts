"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { signOut } from "@/auth";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

export function useAuth() {
  const { data: sessionData, status: sessionStatus } = useSession();
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");
  const router = useRouter();

  useEffect(() => {
    if (sessionStatus === "authenticated" && sessionData) {
      setSession(sessionData);
      setStatus("authenticated");
    } else if (sessionStatus === "unauthenticated") {
      setStatus("unauthenticated");
    } else if (sessionStatus === "loading") {
      setStatus("loading");
    }
  }, [sessionStatus, sessionData]);

  const logout = async () => {
    try {
      await signOut({ redirectTo: "/sign-in" });
      setSession(null);
      setStatus("unauthenticated");
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return { session, status, logout };
}
