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
  searchParams: Promise<{ token_hash?: string; type?: string; code?: string; next?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const next = safeNext(sp.next);

  if (sp.token_hash && typeof sp.type === "string") {
    const { error } = await supabase.auth.verifyOtp({
      type: sp.type,
      token_hash: sp.token_hash,
    });
    if (!error && !sp.type.startsWith("recovery")) {
      if (await needsMfa(supabase)) {
        redirect(`/login?mfa=1&next=${encodeURIComponent(next)}`);
      }
      redirect(next);
    }
    if (!error) {
      redirect("/login/reset");
    }
  } else if (sp.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(sp.code);
    if (!error) {
      if (await needsMfa(supabase)) {
        redirect(`/login?mfa=1&next=${encodeURIComponent(next)}`);
      }
      redirect(next);
    }
  }

  return <ConfirmClient next={next} />;
}