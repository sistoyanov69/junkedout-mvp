"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * This type is intentionally minimal and matches content/eu-context.ts.
 * Optional fields allow future enrichment without breaking builds.
 */
export interface EUContextItem {
  title: string;
  summary?: string;
  description?: string;
  url?: string;
  year?: number;
  tag?: string;
  source?: string;
}

/**
 * Props accept exactly what the content layer exports.
 */
type Props = {
  items: EUContextItem[];
  intervalMs?: number;
};

function text(v?: string | number): string {
  return v === undefined || v === null ? "" : String(v);
}

export default function EUContextCarousel({
  items,
  intervalMs = 6500,
}: Props) {
  const count = items.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);

  const current = useMemo(() => {
    if (count === 0) return null;
    return items[index % count];
  }, [items, index, count]);

  useEffect(() => {
    if (count <= 1 || paused) return;

    timer.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, intervalMs);

    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [count, paused, intervalMs]);

  if (!current) return null;

  return (
    <section
      className="w-full mx-auto max-w-6xl px-6 pb-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">
            EU Context We Build Upon
          </h2>
          <p className="mt-2 text-sm text-[#9AA3B2] max-w-2xl">
            Selected official EU materials that shape our design and policy alignment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#9AA3B2]">
            {index + 1} / {count}
          </span>

          <button
            onClick={() => setIndex((i) => (i - 1 + count) % count)}
            className="h-9 w-9 rounded-md border border-[#243142] hover:bg-[#0F1A2B]"
            aria-label="Previous"
          >
            ‹
          </button>

          <button
            onClick={() => setIndex((i) => (i + 1) % count)}
            className="h-9 w-9 rounded-md border border-[#243142] hover:bg-[#0F1A2B]"
            aria-label="Next"
          >
            ›
          </button>
        </div>
      </div>

      {/* Card */}
      <article className="mt-6 rounded-xl border border-[#243142] bg-[#0B1220]/60 p-6">
        {/* Top row */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg border border-[#243142] bg-[#0B1220] flex items-center justify-center">
            <Image src="/icons/eu.svg" alt="EU" width={18} height={18} />
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#9AA3B2]">
              EU Guidance
            </div>
            <div className="text-xs text-[#9AA3B2]">
              {text(current.source || "European Union")}
              {current.year ? ` • ${current.year}` : ""}
            </div>
          </div>

          {current.tag && (
            <span className="ml-auto text-xs rounded-full border border-[#243142] px-2 py-1">
              {current.tag}
            </span>
          )}
        </div>

        {/* Content */}
        <h3 className="mt-5 text-lg sm:text-xl font-semibold">
          {current.title}
        </h3>

        {(current.summary || current.description) && (
          <p className="mt-3 text-sm text-[#9AA3B2] max-w-3xl">
            {current.summary ?? current.description}
          </p>
        )}

        {current.url && (
          <div className="mt-5">
            <a
              href={current.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold hover:text-white"
            >
              Read original →
            </a>
          </div>
        )}
      </article>

      {/* Dots */}
      {count > 1 && (
        <div className="mt-4 flex gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 rounded-full border ${
                i === index
                  ? "bg-white border-white"
                  : "border-[#243142]"
              }`}
              aria-label={`Go to item ${i + 1}`}
            />
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-[#6F7A8A]">
        External links lead to official EU publications. Summaries are provided by JunkedOut for context.
      </p>
    </section>
  );
}

