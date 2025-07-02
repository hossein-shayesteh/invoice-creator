"use server";

import { signIn, signOut } from "@/auth";

export const handleSignOut = async () => {
  await signOut();
};

export const handleSignIn = async (formDate: FormData) => {
  await signIn("credentials", formDate);
};
