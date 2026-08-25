"use client";

import { usePathname } from "next/navigation";
import { SITE_URL } from "@/lib/site";

/**
 * Инjectит <link rel="canonical"> на стороне клиента.
 * App Router не даёт путь в root layout серверно, поэтому используем
 * usePathname — поисковики корректно считывают канонический URL.
 */
export function Canonical() {
  const pathname = usePathname();
  if (!pathname) return null;
  const href = `${SITE_URL}${pathname === "/" ? "" : pathname}`;
  return <link rel="canonical" href={href} />;
}
