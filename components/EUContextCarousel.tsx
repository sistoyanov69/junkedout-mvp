'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

type AnyItem = Record<string, unknown>;

type Props = {
  items: ReadonlyArray<AnyItem>;
  title?: string;
  subtitle?: string;
  /** autoplay interval in ms (set 0 to disable) */
  autoplayMs?: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function asNumberLike(v: unknown): string | undefined {
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string' && v.trim().length > 0) return v;
  return undefined;
}

function pickUrl(it: AnyItem): string | undefined {
  // Support multiple shapes: url | href | link
  return asString(it.url) ?? asString(it.href) ?? asString(it.link);
}

function pickTitle(it: AnyItem): string {
  return (
    asString(it.title) ??
    asString(it.name) ??
    asString(it.heading) ??
    'EU publication'
  );
}

function pickSummary(it: AnyItem): string {
  return (
    asString(it.summary) ??
    asString(it.description) ??
    asString(it.excerpt) ??
    ''
  );
}

function pickOrg(it: AnyItem): string {
  return asString(it.org) ?? asString(it.source) ?? 'European Commission';
}

function pickTag(it: AnyItem): string | undefined {
  return asString(it.tag) ?? asString(it.topic) ?? asString(it.category);
}

export default function EUContextCarousel({
  items,
  title = 'EU Context We Build Upon',
  subtitle = 'Selected official EU materials that shape our design and policy alignment.',
  autoplayMs = 6500,
}: Props) {
  const total = items.length;

  // We slide one card at a time; visible cards is responsive via CSS widths:
  // - mobile: 1 card (w-full)
  // - md+:    3 cards (md:w-1/3)
  const visible = 3;
  const maxIndex = Math.max(0, total - visible);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const indexSafe = useMemo(() => clamp(index, 0, maxIndex), [index, maxIndex]);

  // Keep state in range WITHOUT setState-in-effect (lint rule)
  // If index is out of range, we clamp in the render value and also
  // correct it lazily on interaction/autoplay.
  const goTo = (next: number) => setIndex(clamp(next, 0, maxIndex));
  const prev = () => goTo(indexSafe - 1);
  const next = () => goTo(indexSafe + 1);

  const pages = Math.max(1, maxIndex + 1);
  const page = clamp(indexSafe + 1, 1, pages);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!autoplayMs || autoplayMs <= 0) return;
    if (paused) return;
    if (total <= visible) return;

    // window.setInterval returns number in the browser
    intervalRef.current = window.setInterval(() => {
      setIndex((cur) => {
        const curSafe = clamp(cur, 0, maxIndex);
        const nxt = curSafe + 1;
        return nxt > maxIndex ? 0 : nxt;
      });
    }, autoplayMs);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoplayMs, paused, total, maxIndex]);

  // Translation is based on 1-card step; on md+ each card is 1/3 width, so step = 33.333%
  const stepPct = 100 / visible;
  const translateX = -(indexSafe * stepPct);

  // Render only valid-ish items
  const safeItems = useMemo(() => {
    return items
      .map((it) => ({
        raw: it,
        url: pickUrl(it),
        title: pickTitle(it),
        summary: pickSummary(it),
        org: pickOrg(it),
        year: asNumberLike(it.year),
        tag: pickTag(it),
      }))
      .filter((it) => Boolean(it.url)); // require URL to be useful
  }, [items]);

  if (safeItems.length === 0) return null;

  return (
    <section
      className="mx-auto max-w-6xl px-6 pb-14 pt-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="EU context carousel"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#9AA3B2]">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-[#9AA3B2]">
            {page} / {pages}
          </div>
          <button
            type="button"
            onClick={prev}
            disabled={total <= visible}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#2A3142] bg-[#111827] text-white hover:bg-[#0F172A] disabled:opacity-40"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            disabled={total <= visible}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#2A3142] bg-[#111827] text-white hover:bg-[#0F172A] disabled:opacity-40"
            aria-label="Next"
          >
            ›
          </button>
        </div>
      </div>

      {/* Same “block” feel as your upper section: full width, bordered panel */}
      <div className="mt-6 rounded-2xl border border-[#2A3142] bg-[#0B1220]/60 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(${translateX}%)` }}
          >
            {safeItems.map((it, i) => (
              <div
                key={`${it.url ?? 'eu'}-${i}`}
                className="shrink-0 px-2 w-full md:w-1/3"
              >
                {/* Credit-card-ish ratio: taller than the old tiny cards */}
                <article className="h-full min-h-[260px] rounded-2xl border border-[#2A3142] bg-[#0E1726] p-5 hover:bg-[#0F1A2B] transition">
                  <header className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg border border-[#2A3142] bg-[#0B1220]">
                        <Image
                          src="/icons/eu.svg"
                          alt="EU"
                          width={18}
                          height={18}
                        />
                      </div>
                      <div className="leading-tight">
                        <div className="text-[11px] uppercase tracking-wide text-[#9AA3B2]">
                          EU Guidance
                        </div>
                        <div className="text-[12px] text-[#9AA3B2]">
                          {it.org}
                          {it.year ? ` • ${it.year}` : ''}
                        </div>
                      </div>
                    </div>

                    {it.tag ? (
                      <span className="rounded-full border border-[#2A3142] bg-[#0B1220] px-3 py-1 text-xs text-[#E6E8EB]">
                        {it.tag}
                      </span>
                    ) : null}
                  </header>

                  <h3 className="mt-5 line-clamp-2 text-lg font-semibold text-white">
                    {it.title}
                  </h3>

                  {it.summary ? (
                    <p className="mt-3 line-clamp-4 text-sm text-[#9AA3B2]">
                      {it.summary}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-[#9AA3B2]">
                      Official EU material relevant to anti-discrimination, labour
                      market fairness, and evidence-based policy.
                    </p>
                  )}

                  <div className="mt-6">
                    <a
                      href={it.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#93C5FD] hover:underline"
                    >
                      Read original <span aria-hidden>→</span>
                    </a>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="mt-5 flex items-center justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => {
            const active = i === indexSafe;
            return (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={[
                  'h-2.5 w-2.5 rounded-full border',
                  active
                    ? 'border-[#93C5FD] bg-[#93C5FD]/80'
                    : 'border-[#2A3142] bg-transparent hover:bg-white/10',
                ].join(' ')}
                aria-label={`Go to ${i + 1}`}
              />
            );
          })}
        </div>

        <p className="mt-4 text-xs text-[#6B7280]">
          External links lead to official EU publications. Summaries are provided by
          JunkedOut for context.
        </p>
      </div>
    </section>
  );
}

