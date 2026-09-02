"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function ConfirmClient({ next }: { next: string }) {
  const router = useRouter();
  const [status, setStatus] = useState("Идёт вход…");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        router.push(next);
        router.refresh();
      } else {
        setStatus("Вход не выполнен. Запросите код заново на странице входа.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [next, router]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 mb-4">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <p className="text-sm text-gray-600">{status}</p>
      </div>
    </div>
  );
}