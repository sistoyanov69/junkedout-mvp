'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

type AnyItem = Record<string, unknown>;

type Props = {
  items: unknown[];
  autoplayMs?: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function getString(it: AnyItem, key: string): string | undefined {
  const v = it[key];
  return typeof v === 'string' && v.trim() ? v : undefined;
}

function getNumber(it: AnyItem, key: string): number | undefined {
  const v = it[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

function normalizeItems(items: unknown[]) {
  return (items ?? [])
    .filter((x): x is AnyItem => typeof x === 'object' && x !== null)
    .map((it) => {
      const link =
        getString(it, 'href') ??
        getString(it, 'url') ??
        '#';

      return {
        title: getString(it, 'title') ?? 'Untitled',
        summary:
          getString(it, 'summary') ??
          getString(it, 'description') ??
          '',
        link,
        tag: getString(it, 'tag'),
        org: getString(it, 'org') ?? 'European Commission',
        year: getNumber(it, 'year'),
      };
    })
    .filter((it) => it.link !== '#');
}

export default function EUContextCarousel({
  items,
  autoplayMs = 6500,
}: Props) {
  const safeItems = useMemo(() => normalizeItems(items), [items]);
  const total = safeItems.length;

  const [index, setIndex] = useState(0);
  const safeIndex = clamp(index, 0, Math.max(0, total - 1));

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (total <= 1) return;

    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, autoplayMs);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoplayMs, total]);

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-3xl font-semibold text-white">
            EU Context We Build Upon
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#9AA3B2]">
            Selected official EU materials that shape our design and policy alignment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#9AA3B2]">
            {safeIndex + 1} / {total}
          </span>
          <button
            onClick={goPrev}
            className="h-9 w-9 rounded-lg border border-[#2A3142] bg-[#0B1220] hover:bg-[#0F1A2B]"
          >
            ‹
          </button>
          <button
            onClick={goNext}
            className="h-9 w-9 rounded-lg border border-[#2A3142] bg-[#0B1220] hover:bg-[#0F1A2B]"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#2A3142] bg-[#0B1220] p-6 overflow-hidden">
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${safeIndex * 33.333}%)` }}
        >
          {safeItems.map((it, i) => (
            <article
              key={`${it.link}-${i}`}
              className="w-full lg:w-1/3 px-3"
            >
              <div className="h-full rounded-2xl border border-[#2A3142] bg-[#0E1726] p-6 hover:bg-[#0F1A2B] transition">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg border border-[#2A3142] bg-[#0B1220]">
                      <Image
                        src="/icons/eu.svg"
                        alt="EU"
                        width={20}
                        height={20}
                      />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-[#9AA3B2]">
                        EU GUIDANCE
                      </div>
                      <div className="text-xs text-[#9AA3B2]">
                        {it.org}
                        {it.year ? ` • ${it.year}` : ''}
                      </div>
                    </div>
                  </div>

                  {it.tag && (
                    <span className="rounded-full border border-[#B45309] px-3 py-1 text-xs font-semibold text-[#F59E0B]">
                      {it.tag}
                    </span>
                  )}
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white hover:text-[#F59E0B] transition">
                  {it.title}
                </h3>

                <p className="mt-3 text-sm text-[#9AA3B2] line-clamp-4">
                  {it.summary}
                </p>

                <a
                  href={it.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm font-semibold text-[#93C5FD] hover:underline"
                >
                  Read original →
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {safeItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full ${
                i === safeIndex
                  ? 'bg-[#93C5FD]'
                  : 'border border-[#2A3142]'
              }`}
            />
          ))}
        </div>

        <p className="mt-3 text-xs text-[#657089] text-center">
          External links lead to official EU publications. Summaries are provided by JunkedOut for context.
        </p>
      </div>
    </section>
  );
}
