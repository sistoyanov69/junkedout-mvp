"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { EUContextItem } from "@/content/eu-context";

type Props = {
  items: EUContextItem[];
  title?: string;
  subtitle?: string;
  autoplayMs?: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function getProp(it: EUContextItem, key: string): unknown {
  return (it as unknown as Record<string, unknown>)[key];
}

function getText(it: EUContextItem, key: string): string {
  const v = getProp(it, key);
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return "";
}

function getLink(it: EUContextItem): string {
  const href = getProp(it, "href");
  if (typeof href === "string" && href.trim()) return href.trim();

  const url = getProp(it, "url");
  if (typeof url === "string" && url.trim()) return url.trim();

  const link = getProp(it, "link");
  if (typeof link === "string" && link.trim()) return link.trim();

  return "";
}

function initialVisible(): number {
  if (typeof window === "undefined") return 3;
  const w = window.innerWidth;
  if (w >= 1024) return 3;
  if (w >= 768) return 2;
  return 1;
}

export default function EUContextCarousel({
  items,
  title = "EU Context We Build Upon",
  subtitle = "Selected official EU materials that shape our design and policy alignment.",
  autoplayMs = 6500,
}: Props) {
  const safeItems = useMemo(() => (items ?? []).filter(Boolean), [items]);
  const total = safeItems.length;

  // No setState-in-effect: compute initial value from window, then only update via resize callbacks.
  const [visible, setVisible] = useState<number>(initialVisible);
  const [index, setIndex] = useState<number>(0);

  const hoveringRef = useRef(false);

  // Clamp at read-time (no "repair state" effect)
  const maxIndex = Math.max(0, total - 1);
  const indexSafe = useMemo(() => clamp(index, 0, maxIndex), [index, maxIndex]);

  // Resize subscription (setState only in callback)
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const next = w >= 1024 ? 3 : w >= 768 ? 2 : 1;
      setVisible((prev) => (prev === next ? prev : next));
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Autoplay (setState only in interval callback)
  useEffect(() => {
    if (total <= 1) return;

    const t = window.setInterval(() => {
      if (hoveringRef.current) return;
      setIndex((i) => mod(i + 1, total));
    }, autoplayMs);

    return () => window.clearInterval(t);
  }, [autoplayMs, total]);

  const go = (i: number) => {
    if (total <= 0) return;
    setIndex(mod(i, total));
  };

  const prev = () => {
    if (total <= 0) return;
    setIndex((i) => mod(i - 1, total));
  };

  const next = () => {
    if (total <= 0) return;
    setIndex((i) => mod(i + 1, total));
  };

  const slideW = 100 / Math.max(1, visible);
  const translatePct = indexSafe * slideW;

  if (total === 0) return null;

  return (
    <section
      className="mx-auto w-full max-w-6xl px-6 pb-10"
      onMouseEnter={() => {
        hoveringRef.current = true;
      }}
      onMouseLeave={() => {
        hoveringRef.current = false;
      }}
      aria-label="EU Context carousel"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm text-[#9AA3B2]">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden text-xs text-[#9AA3B2] sm:block">
            {total > 0 ? `${indexSafe + 1} / ${total}` : "—"}
          </div>

          <button
            type="button"
            onClick={prev}
            disabled={total <= 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#2A3142] bg-[#141821] text-[#E6E8EB] transition hover:bg-[#1B2130] disabled:opacity-40"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            disabled={total <= 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#2A3142] bg-[#141821] text-[#E6E8EB] transition hover:bg-[#1B2130] disabled:opacity-40"
            aria-label="Next"
          >
            ›
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[#2A3142] bg-[#0F131A] p-4">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${translatePct}%)` }}
          >
            {safeItems.map((it, i) => {
              const link = getLink(it);
              const titleText = getText(it, "title") || "EU publication";
              const summary =
                getText(it, "summary") ||
                getText(it, "description") ||
                getText(it, "excerpt");
              const year = getText(it, "year");
              const source = getText(it, "source") || getText(it, "org") || "European Union";
              const tag = getText(it, "tag");

              return (
                <div
                  key={`${link || titleText}-${i}`}
                  className="shrink-0 px-2"
                  style={{ width: `${slideW}%` }}
                >
                  <article className="h-full rounded-xl border border-[#2A3142] bg-[#141821] p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2A3142] bg-[#0F131A]">
                          <Image src="/icons/eu.svg" alt="EU" width={22} height={22} />
                        </div>

                        <div className="leading-tight">
                          <div className="text-[11px] uppercase tracking-wide text-[#9AA3B2]">
                            EU Guidance
                          </div>
                          <div className="text-[12px] text-[#9AA3B2]">
                            {source}
                            {year ? ` • ${year}` : ""}
                          </div>
                        </div>
                      </div>

                      {tag ? (
                        <span className="rounded-full border border-[#2A3142] bg-[#0F131A] px-2.5 py-1 text-[12px] text-[#E6E8EB]">
                          {tag}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-4 line-clamp-2 text-lg font-semibold leading-snug text-[#E6E8EB]">
                      {titleText}
                    </h3>

                    {summary ? (
                      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-[#9AA3B2]">
                        {summary}
                      </p>
                    ) : (
                      <p className="mt-3 text-sm text-[#6F7A8C]">
                        (No summary available in the content list yet.)
                      </p>
                    )}

                    <div className="mt-5">
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#93C5FD] hover:underline"
                        >
                          Read original <span aria-hidden>→</span>
                        </a>
                      ) : (
                        <span className="text-sm text-[#6F7A8C]">No link provided</span>
                      )}
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: total }).map((_, i) => {
            const active = i === indexSafe;
            return (
              <button
                key={`dot-${i}`}
                type="button"
                onClick={() => go(i)}
                className={`h-2.5 w-2.5 rounded-full border transition ${
                  active
                    ? "border-[#93C5FD] bg-[#93C5FD]"
                    : "border-[#2A3142] bg-[#0F131A] hover:bg-[#1B2130]"
                }`}
                aria-label={`Go to item ${i + 1}`}
              />
            );
          })}
        </div>

        <p className="mt-4 text-xs text-[#6F7A8C]">
          External links lead to official EU publications. Summaries are provided by JunkedOut for context.
        </p>
      </div>
    </section>
  );
}

