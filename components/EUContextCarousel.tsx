"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  // Intentionally permissive to avoid type-mismatch traps between content file and component.
  // We normalize fields at runtime (href/url, description/summary, etc.).
  items: any[];
  intervalMs?: number; // default 6500
  title?: string; // default "EU Context We Build Upon"
  subtitle?: string; // default "Selected official EU materials that shape our design and policy alignment."
};

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function firstNonEmpty(...vals: unknown[]): string {
  for (const v of vals) {
    const s = asString(v).trim();
    if (s) return s;
  }
  return "";
}

function clampIndex(i: number, n: number) {
  if (n <= 0) return 0;
  return ((i % n) + n) % n;
}

export default function EUContextCarousel({
  items,
  intervalMs = 6500,
  title = "EU Context We Build Upon",
  subtitle = "Selected official EU materials that shape our design and policy alignment.",
}: Props) {
  const safeItems = useMemo(() => (Array.isArray(items) ? items.filter(Boolean) : []), [items]);
  const n = safeItems.length;

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const current = useMemo(() => {
    if (n === 0) return null;
    const it = safeItems[clampIndex(idx, n)] ?? {};
    // Normalize typical field names used across iterations
    const href = firstNonEmpty(it.href, it.url, it.link);
    const label = firstNonEmpty(it.label, it.kind, it.type, "EU Guidance");
    const org = firstNonEmpty(it.org, it.source, it.publisher, "European Union");
    const year = firstNonEmpty(it.year, it.date, it.published);
    const tag = firstNonEmpty(it.tag, it.topic, it.category);
    const title = firstNonEmpty(it.title, it.name);
    const description = firstNonEmpty(it.description, it.summary, it.excerpt);

    return { href, label, org, year, tag, title, description };
  }, [safeItems, idx, n]);

  // Auto-advance
  useEffect(() => {
    if (n <= 1) return;
    if (paused) return;

    timerRef.current = window.setInterval(() => {
      setIdx((v) => clampIndex(v + 1, n));
    }, intervalMs);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [n, paused, intervalMs]);

  const prev = () => setIdx((v) => clampIndex(v - 1, n));
  const next = () => setIdx((v) => clampIndex(v + 1, n));

  if (!current) return null;

  return (
    <section
      className="w-full mx-auto max-w-6xl px-6 pb-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-label="EU Context carousel"
    >
      {/* Header row aligned to page width */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm text-[#9AA3B2] max-w-2xl">{subtitle}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="text-xs text-[#9AA3B2] hidden sm:block">
            {n > 0 ? (
              <>
                {clampIndex(idx, n) + 1} / {n}
              </>
            ) : null}
          </div>

          <button
            type="button"
            onClick={prev}
            disabled={n <= 1}
            className="h-9 w-9 rounded-md border border-[#243142] bg-[#0B1220] text-[#E6E8EB] disabled:opacity-40 hover:bg-[#0F1A2B] transition"
            aria-label="Previous EU item"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            disabled={n <= 1}
            className="h-9 w-9 rounded-md border border-[#243142] bg-[#0B1220] text-[#E6E8EB] disabled:opacity-40 hover:bg-[#0F1A2B] transition"
            aria-label="Next EU item"
          >
            ›
          </button>
        </div>
      </div>

      {/* Single feature card, centered, same width as page content */}
      <div className="mt-6">
        <article className="rounded-xl border border-[#243142] bg-[#0B1220]/60 p-6 shadow-sm">
          {/* Card header: EU flag + label + org/year */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg border border-[#243142] bg-[#0B1220] flex items-center justify-center">
                <Image src="/icons/eu.svg" alt="EU" width={18} height={18} />
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wider text-[#9AA3B2]">
                  {current.label || "EU Guidance"}
                </div>
                <div className="text-xs text-[#9AA3B2]">
                  {(current.org || "European Union") + (current.year ? ` • ${current.year}` : "")}
                </div>
              </div>
            </div>

            {current.tag ? (
              <span className="text-xs rounded-full border border-[#243142] px-2 py-1 text-[#C9CED6] bg-[#0B1220]">
                {current.tag}
              </span>
            ) : null}
          </div>

          {/* Title + description */}
          <h3 className="mt-5 text-lg sm:text-xl font-semibold leading-snug">
            {current.title || "EU publication"}
          </h3>

          {current.description ? (
            <p className="mt-3 text-sm text-[#9AA3B2] leading-relaxed max-w-3xl">
              {current.description}
            </p>
          ) : null}

          {/* Link */}
          <div className="mt-5">
            {current.href ? (
              <a
                href={current.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#E6E8EB] hover:text-white"
              >
                Read original <span aria-hidden>→</span>
              </a>
            ) : (
              <span className="text-sm text-[#9AA3B2]">Link unavailable</span>
            )}
          </div>

          {/* Dots */}
          {n > 1 ? (
            <div className="mt-6 flex items-center gap-2">
              {safeItems.map((_, i) => {
                const active = clampIndex(idx, n) === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIdx(i)}
                    className={`h-2.5 w-2.5 rounded-full border transition ${
                      active
                        ? "bg-[#E6E8EB] border-[#E6E8EB]"
                        : "bg-transparent border-[#243142] hover:border-[#6B7280]"
                    }`}
                    aria-label={`Go to item ${i + 1}`}
                  />
                );
              })}
              <div className="ml-2 text-xs text-[#9AA3B2]">
                {paused ? "Paused" : "Auto-rotating"}
              </div>
            </div>
          ) : null}
        </article>

        <p className="mt-3 text-xs text-[#6F7A8A]">
          External links lead to official EU publications. Summaries are provided by JunkedOut for contextual reference.
        </p>
      </div>
    </section>
  );
}

