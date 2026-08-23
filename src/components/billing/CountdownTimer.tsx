"use client";
import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endsAt: number;
  compact?: boolean;
  className?: string;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer({
  endsAt,
  compact,
  className = "",
}: CountdownTimerProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, endsAt - now);
  if (diff <= 0) return null;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  if (compact) {
    return (
      <span className={`tabular-nums ${className}`}>
        {days > 0 ? `${days} д ` : ""}
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
    );
  }

  const cells = [
    { value: days, label: "дней" },
    { value: hours, label: "часов" },
    { value: minutes, label: "минут" },
    { value: seconds, label: "секунд" },
  ];

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {cells.map((c) => (
        <div
          key={c.label}
          className="flex flex-col items-center min-w-[52px] px-1.5 py-1 rounded-lg bg-white/15 border border-white/20"
        >
          <span className="text-lg font-bold tabular-nums leading-none">
            {pad(c.value)}
          </span>
          <span className="text-[10px] opacity-80 mt-0.5">{c.label}</span>
        </div>
      ))}
    </div>
  );
}