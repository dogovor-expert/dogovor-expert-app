const APIPOINT_URL = "https://apipoint.ru/api/call";

export function getApipointToken() {
  return process.env.APIPOINT_TOKEN?.trim() || "";
}

export async function callApipoint(source: string, params: Record<string, string>) {
  const token = getApipointToken();
  if (!token) {
    throw new Error("APIPOINT_TOKEN not configured");
  }
  const res = await fetch(APIPOINT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sources: source, ...params }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    throw new Error(`apipoint ${source}: HTTP ${res.status}`);
  }
  const json = await res.json().catch(() => null);
  if (!json) {
    throw new Error(`apipoint ${source}: empty response`);
  }
  return json;
}

export interface ReportBundle {
  vin: string;
  sources: Record<string, unknown>;
}

export async function collectReport(vin: string): Promise<ReportBundle> {
  const sources = ["vindecode", "gibddhistory2", "dtp", "zalog"];
  const out: Record<string, unknown> = {};
  for (const s of sources) {
    try {
      out[s] = await callApipoint(s, { vin });
    } catch {
      out[s] = { error: true };
    }
  }
  return { vin, sources: out };
}