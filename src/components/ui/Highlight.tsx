"use client";
import { highlightSegments } from "@/lib/search";

interface HighlightProps {
  text: string;
  query: string;
}

export default function Highlight({ text, query }: HighlightProps) {
  const segments = highlightSegments(text, query);
  if (segments.length === 1) return <>{text}</>;
  return (
    <>
      {segments.map((seg, i) =>
        seg.hit ? (
          <mark
            key={i}
            className="bg-amber-100 text-amber-900 rounded-[3px] px-0.5"
          >
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}
