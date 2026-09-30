import Link from "next/link";
import { FileSignature } from "lucide-react";

interface LogoProps {
  /** Тёмный фон (сайдбар в тёмной теме) */
  dark?: boolean;
  /** Подпись «Юридические документы онлайн» */
  tagline?: boolean;
}

/**
 * Единый логотип Dogovor.expert (по макету главной):
 * иконка FileSignature в бренд-градиенте + вордмарк + дескриптор.
 */
export default function Logo({ dark = false, tagline = true }: LogoProps) {
  return (
    <Link
      href="/"
      className="flex min-w-0 items-center gap-2.5"
      aria-label="Dogovor.expert — на главную"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-white shadow-lg shadow-brand-600/25">
        <FileSignature className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className={`truncate text-lg font-bold tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
          Dogovor<span className={dark ? "text-brand-300" : "text-brand-600"}>.expert</span>
        </span>
        {tagline && (
          <span className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Юридические документы онлайн
          </span>
        )}
      </span>
    </Link>
  );
}
