"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { EUContextItem } from "@/content/eu-context";

type Props = {
  items: EUContextItem[];
  intervalMs?: number; // default 7000
};

export default function EUContextCarousel({ items, intervalMs = 7000 }: Props) {
  const safeItems = useMemo(() => items.filter(Boolean), [items]);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 3 cards visible per "page"
  const perPage = 3;
  const pages = Math.max(1, Math.ceil(safeItems.length / perPage));

  const pageItems = (p: number) =>
    safeItems.slice(p * perPage, p * perPage + perPage);

  // Respect reduced motion
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (pages <= 1) return;
    if (paused) return;

    const t = setInterval(() => {
      setPage((x) => (x + 1) % pages);
    }, intervalMs);

    return () => clearInterval(t);
  }, [intervalMs, pages, paused, prefersReducedMotion]);

  if (safeItems.length === 0) return null;

  function prev() {
    setPage((x) => (x - 1 + pages) % pages);
  }
  function next() {
    setPage((x) => (x + 1) % pages);
  }

  return (
    <section
      className="mt-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Center column container (NOT full width) */}
      <div className="mx-auto max-w-5xl px-2">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">EU Context We Build Upon</h2>
            <p className="text-sm text-gray-400 mt-1">
              Selected official EU materials that JunkedOut operationalizes through real-world evidence.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={prev}
              className="px-3 py-2 rounded border border-gray-700 hover:border-gray-500"
              aria-label="Previous"
              disabled={pages <= 1}
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              className="px-3 py-2 rounded border border-gray-700 hover:border-gray-500"
              aria-label="Next"
              disabled={pages <= 1}
            >
              →
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div
          ref={containerRef}
          className="mt-4 overflow-hidden rounded-xl border border-gray-800 bg-gray-950/40"
        >
          {/* Track */}
          <div
            className="flex"
            style={{
              width: `${pages * 100}%`,
              transform: `translateX(-${page * (100 / pages)}%)`,
              transition: prefersReducedMotion ? "none" : "transform 500ms ease",
            }}
          >
            {Array.from({ length: pages }).map((_, p) => (
              <div key={p} className="w-full" style={{ width: `${100 / pages}%` }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
                  {pageItems(p).map((it) => (
                    <article
                      key={it.id}
                      className="rounded-lg border border-gray-800 bg-black/30 p-4 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <img src="/icons/eu.svg" alt="EU" className="h-4 w-4" loading="lazy" />
                        <span>
                          {it.source} · {it.year} · {it.tag}
                        </span>
                      </div>

                      <h3 className="mt-2 text-base font-semibold text-white break-words line-clamp-2">
                        {it.title}
                      </h3>

                      <p className="mt-2 text-sm text-gray-300 leading-relaxed line-clamp-4">
                        {it.summary}
                      </p>

                      <a
                        href={it.link}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex mt-3 text-sm underline text-gray-200 hover:text-white"
                      >
                        Read EU source →
                      </a>
                    </article>
                  ))}

                  {/* If last page has < 3 items, keep layout stable */}
                  {pageItems(p).length < perPage &&
                    Array.from({ length: perPage - pageItems(p).length }).map((__, idx) => (
                      <div
                        key={`pad-${p}-${idx}`}
                        className="hidden md:block rounded-lg border border-dashed border-gray-800 bg-transparent"
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 pb-4">
            {Array.from({ length: pages }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPage(idx)}
                className={`h-2.5 w-2.5 rounded-full ${
                  idx === page ? "bg-gray-200" : "bg-gray-700 hover:bg-gray-600"
                }`}
                aria-label={`Go to page ${idx + 1}`}
                disabled={pages <= 1}
              />
            ))}
          </div>
        </div>

        <p className="mt-2 text-xs text-gray-500">
          External links lead to official EU publications. Summaries are provided by JunkedOut for contextual reference.
        </p>
      </div>
    </section>
  );
}

