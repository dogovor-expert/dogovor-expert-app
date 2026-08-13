import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ConfirmClient from "./ConfirmClient";

export default async function AuthConfirmPage({
  searchParams,
}: {
  searchParams: { token_hash?: string; type?: string; code?: string; next?: string };
}) {
  const supabase = createClient();
  const next = typeof searchParams.next === "string" ? searchParams.next : "/dashboard";

  if (searchParams.token_hash && typeof searchParams.type === "string") {
    const { error } = await supabase.auth.verifyOtp({
      type: searchParams.type,
      token_hash: searchParams.token_hash,
    });
    if (!error) {
      redirect(next);
    }
  } else if (searchParams.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(searchParams.code);
    if (!error) {
      redirect(next);
    }
  }

  return <ConfirmClient next={next} />;
}