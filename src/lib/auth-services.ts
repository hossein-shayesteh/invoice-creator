"use server";

import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";

export const handleSignOut = async () => {
  await signOut();
};

export const handleSignIn = async (formData: FormData) => {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    redirect("/sign-in?error=MissingCredentials");
  }

  try {
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      redirect("/sign-in?error=CredentialsSignin");
    }

    redirect("/dashboard");
  } catch (error) {
    // Check if it's a redirect error (which is expected)
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    redirect("/sign-in?error=CredentialsSignin");
  }
};
