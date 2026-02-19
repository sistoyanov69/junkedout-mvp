'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type AnyObj = Record<string, unknown>;

type Props = {
  items: unknown[];
  autoplayMs?: number; // default 6500
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

function asNumber(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

function pickFirstString(obj: AnyObj, keys: string[]) {
  for (const k of keys) {
    const v = asString(obj[k]);
    if (v) return v;
  }
  return undefined;
}

function normalizeItems(items: unknown[]) {
  const arr = (items ?? []).filter((x): x is AnyObj => typeof x === 'object' && x !== null);

  return arr.map((it) => {
    // Support multiple schemas from content/eu-context.ts
    const url = pickFirstString(it, ['url', 'href', 'link', 'sourceUrl', 'source', 'permalink']);
    const title = pickFirstString(it, ['title', 'name', 'headline']) ?? 'Untitled';
    const description =
      pickFirstString(it, ['description', 'summary', 'excerpt', 'text']) ?? '';

    const org = pickFirstString(it, ['org', 'organization', 'publisher', 'sourceOrg']) ?? 'European Commission';
    const year = asNumber(it['year']);
    const tag = pickFirstString(it, ['tag', 'topic', 'label', 'category']);

    return { url, title, description, org, year, tag };
  });
}

export default function EUContextCarousel({ items, autoplayMs = 6500 }: Props) {
  const normalized = useMemo(() => normalizeItems(items), [items]);

  // Keep items even if url is missing (we’ll disable the link UI),
  // but for the carousel we prefer items with a url.
  const usable = useMemo(() => normalized.filter((x) => !!x.url), [normalized]);

  const list = usable.length > 0 ? usable : normalized; // fallback to show something
  const total = list.length;

  const [index, setIndex] = useState(0);
  const safeIndex = total > 0 ? clamp(index, 0, total - 1) : 0;

  // Desktop shows 3 cards; mobile shows 1.
  // We’ll compute “pages” for the dots / counter based on desktop=3.
  const visibleDesktop = 3;
  const pageCount =
    total <= 0 ? 0 : Math.max(1, Math.ceil(total / visibleDesktop));
  const currentPage =
    total <= 0 ? 0 : Math.floor(safeIndex / visibleDesktop) + 1;

  const timerRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  const goPrev = () => {
    if (total <= 0) return;
    setIndex((i) => (i - 1 + total) % total);
  };

  const goNext = () => {
    if (total <= 0) return;
    setIndex((i) => (i + 1) % total);
  };

  // Autoplay (pause on hover)
  useEffect(() => {
    if (total <= 1) return;

    // clear any previous timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = window.setInterval(() => {
      if (pausedRef.current) return;
      setIndex((i) => (i + 1) % total);
    }, autoplayMs);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoplayMs, total]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      {/* Header row */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-3xl font-semibold text-white">EU Context We Build Upon</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#9AA3B2]">
            Selected official EU materials that shape our design and policy alignment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#9AA3B2]">
            {pageCount === 0 ? '0 / 0' : `${currentPage} / ${pageCount}`}
          </span>

          <button
            onClick={goPrev}
            disabled={total <= 1}
            className="h-9 w-9 rounded-lg border border-[#2A3142] bg-[#0B1220] hover:bg-[#0F1A2B] disabled:opacity-40 disabled:hover:bg-[#0B1220]"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            onClick={goNext}
            disabled={total <= 1}
            className="h-9 w-9 rounded-lg border border-[#2A3142] bg-[#0B1220] hover:bg-[#0F1A2B] disabled:opacity-40 disabled:hover:bg-[#0B1220]"
            aria-label="Next"
          >
            ›
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        className="mt-6 rounded-2xl border border-[#2A3142] bg-[#0B1220] p-6 overflow-hidden"
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
      >
        {total === 0 ? (
          <div className="rounded-2xl border border-[#2A3142] bg-[#0E1726] p-6 text-sm text-[#9AA3B2]">
            EU context items are not available yet (content list is empty or failed to load).
          </div>
        ) : (
          <>
            <div
              className="flex transition-transform duration-500"
              style={{
                // Move by one “card step”; layout ensures 1 card per view on mobile, 3 on lg.
                transform: `translateX(-${safeIndex * 100}%)`,
              }}
            >
              {list.map((it, i) => (
                <div
                  key={`${it.url ?? 'no-url'}-${i}`}
                  className="shrink-0 basis-full lg:basis-1/3 px-2"
                  // On mobile: each item is full width; translateX uses 100% per item
                  // On lg: items are 1/3 each, but translateX still works because each item’s basis is fixed;
                  // the extra width is handled by flex container overflow.
                >
                  <article className="h-full rounded-2xl border border-[#2A3142] bg-[#0E1726] p-6 hover:bg-[#0F1A2B] transition">
                    {/* top line */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg border border-[#2A3142] bg-[#0B1220]">
                          <Image src="/icons/eu.svg" alt="EU" width={20} height={20} />
                        </div>
                        <div className="leading-tight">
                          <div className="text-[11px] font-semibold tracking-wide text-[#F59E0B]">
                            EU GUIDANCE
                          </div>
                          <div className="text-xs text-[#9AA3B2]">
                            {it.org}
                            {it.year ? ` • ${it.year}` : ''}
                          </div>
                        </div>
                      </div>

                      {it.tag ? (
                        <span className="rounded-full border border-[#B45309] bg-[#0B1220] px-3 py-1 text-xs font-semibold text-[#F59E0B]">
                          {it.tag}
                        </span>
                      ) : null}
                    </div>

                    {/* title */}
                    <h3 className="mt-5 text-lg font-semibold text-[#E6E8EE] hover:text-[#F59E0B] transition line-clamp-2">
                      {it.title}
                    </h3>

                    {/* body */}
                    <p className="mt-3 text-sm text-[#9AA3B2] line-clamp-4">
                      {it.description}
                    </p>

                    {/* link */}
                    <div className="mt-5">
                      {it.url ? (
                        <a
                          href={it.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#93C5FD] hover:underline"
                        >
                          Read original <span aria-hidden>→</span>
                        </a>
                      ) : (
                        <span className="text-sm text-[#657089]">
                          Source link unavailable
                        </span>
                      )}
                    </div>
                  </article>
                </div>
              ))}
            </div>

            {/* dots – based on “pages of 3” */}
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: pageCount }).map((_, p) => {
                const isActive = p + 1 === currentPage;
                return (
                  <button
                    key={p}
                    onClick={() => setIndex(p * visibleDesktop)}
                    className={`h-2 w-2 rounded-full ${
                      isActive ? 'bg-[#93C5FD]' : 'border border-[#2A3142]'
                    }`}
                    aria-label={`Go to page ${p + 1}`}
                  />
                );
              })}
            </div>

            <p className="mt-3 text-xs text-[#657089] text-center">
              External links lead to official EU publications. Summaries are provided by JunkedOut for context.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
