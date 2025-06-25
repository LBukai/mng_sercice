"use server";

import { signIn } from "@/app/auth";

export async function login(callbackUrl: string | null) {
  return await signIn("microsoft-entra-id", { redirectTo: callbackUrl ?? '/' });
}