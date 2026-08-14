import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ConfirmClient from "./ConfirmClient";

function safeNext(next: string | undefined): string {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

async function needsMfa(supabase: Awaited<ReturnType<typeof createClient>>): Promise<boolean> {
  const { data } = await supabase.auth.mfa.listFactors();
  return data?.totp.some((f) => f.status === "verified") ?? false;
}

export default async function AuthConfirmPage({
  searchParams,
}: {
  searchParams: { token_hash?: string; type?: string; code?: string; next?: string };
}) {
  const supabase = createClient();
  const next = safeNext(searchParams.next);

  if (searchParams.token_hash && typeof searchParams.type === "string") {
    const { error } = await supabase.auth.verifyOtp({
      type: searchParams.type,
      token_hash: searchParams.token_hash,
    });
    if (!error && !searchParams.type.startsWith("recovery")) {
      if (await needsMfa(supabase)) {
        redirect(`/login?mfa=1&next=${encodeURIComponent(next)}`);
      }
      redirect(next);
    }
    if (!error) {
      redirect("/login/reset");
    }
  } else if (searchParams.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(searchParams.code);
    if (!error) {
      if (await needsMfa(supabase)) {
        redirect(`/login?mfa=1&next=${encodeURIComponent(next)}`);
      }
      redirect(next);
    }
  }

  return <ConfirmClient next={next} />;
}