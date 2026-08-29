import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadCloudTokens, saveCloudTokens } from "@/lib/cloud/tokenStore";

const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { provider } = await req.json().catch(() => ({}));
  if (provider !== "google") {
    return NextResponse.json({ error: "Only google provider supported for now" }, { status: 400 });
  }

  // Load tokens from vault (IndexedDB is client-side, so we need to store tokens server-side too)
  // For now, we'll read from the request body (client sends refresh_token)
  // In a full implementation, tokens would be stored in Supabase per user
  const { refreshToken } = await req.json().catch(() => ({}));
  if (!refreshToken) {
    return NextResponse.json({ error: "refresh_token not provided" }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Google OAuth not configured on server" }, { status: 500 });
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return NextResponse.json({ error: `Google token refresh failed: ${txt}` }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({
    accessToken: data.access_token,
    expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
    scope: data.scope,
  });
}