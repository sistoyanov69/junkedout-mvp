"use client";

import * as React from "react";
import Image from "next/image";

type NormalizedItem = {
  id: string;
  title: string;
  url: string;
  summary?: string;
  year?: string | number;
  tag?: string;
  source?: string;
};

function asString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function normalizeItem(input: unknown, fallbackIndex: number): NormalizedItem | null {
  if (!input || typeof input !== "object") return null;
  const it = input as Record<string, unknown>;

  const title = asString(it.title) ?? asString(it.name);
  if (!title) return null;

  const url =
    asString(it.href) ??
    asString(it.url) ??
    asString(it.link) ??
    asString(it.sourceUrl) ??
    asString(it.source_url);

  if (!url) return null;

  const id = asString(it.id) ?? `${url}#${fallbackIndex}`;

  const summary =
    asString(it.summary) ??
    asString(it.description) ??
    asString(it.excerpt) ??
    undefined;

  const year = (typeof it.year === "string" || typeof it.year === "number") ? it.year : undefined;
  const tag = asString(it.tag) ?? asString(it.topic) ?? undefined;
  const source = asString(it.source) ?? asString(it.publisher) ?? undefined;

  return { id, title, url, summary, year, tag, source };
}

export default function EUContextCarousel({
  items,
  intervalMs = 7000,
  label = "EU Guidance",
}: {
  items: unknown[];
  intervalMs?: number;
  label?: string;
}) {
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  const normalized = React.useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    const out: NormalizedItem[] = [];
    arr.forEach((x, i) => {
      const n = normalizeItem(x, i);
      if (n) out.push(n);
    });
    return out;
  }, [items]);

  const total = normalized.length;

  const scrollToIndex = React.useCallback(
    (nextIndex: number) => {
      const el = scrollerRef.current;
      if (!el) return;

      const cards = el.querySelectorAll<HTMLElement>("[data-eu-card='1']");
      if (!cards.length) return;

      const clamped = ((nextIndex % cards.length) + cards.length) % cards.length;
      const target = cards[clamped];

      el.scrollTo({
        left: target.offsetLeft - el.offsetLeft,
        behavior: "smooth",
      });

      setIndex(clamped);
    },
    []
  );

  const prev = React.useCallback(() => scrollToIndex(index - 1), [index, scrollToIndex]);
  const next = React.useCallback(() => scrollToIndex(index + 1), [index, scrollToIndex]);

  // Keep index in range if items change
  React.useEffect(() => {
    if (total === 0) return;
    if (index >= total) setIndex(0);
  }, [total, index]);

  // Update index on scroll (so swipe updates “Selected X of Y”)
  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const cards = el.querySelectorAll<HTMLElement>("[data-eu-card='1']");
      if (!cards.length) return;

      const left = el.scrollLeft + 8;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;

      cards.forEach((c, i) => {
        const dist = Math.abs(c.offsetLeft - left);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });

      setIndex(best);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Autoplay
  React.useEffect(() => {
    if (paused) return;
    if (total <= 1) return;

    const t = window.setInterval(() => {
      next();
    }, intervalMs);

    return () => window.clearInterval(t);
  }, [intervalMs, next, paused, total]);

  if (total === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 pb-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">EU Context We Build Upon</h2>
          <p className="mt-1 text-sm text-[#9AA3B2]">
            Selected official EU materials that shape our design and policy alignment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-xs text-[#9AA3B2]">
            Selected {Math.min(index + 1, total)} of {total}
          </div>

          <button
            type="button"
            onClick={prev}
            aria-label="Previous"
            className="rounded-md border border-[#2A3142] bg-[#141821] px-3 py-2 text-white hover:bg-[#1B2130] transition"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next"
            className="rounded-md border border-[#2A3142] bg-[#141821] px-3 py-2 text-white hover:bg-[#1B2130] transition"
          >
            ›
          </button>
        </div>
      </div>

      <div
        className="mt-6"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth [scrollbar-width:thin]"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {normalized.map((it) => (
            <article
              key={it.id}
              data-eu-card="1"
              className="
                shrink-0
                w-[82%] sm:w-[52%] lg:w-[32%]
                rounded-xl border border-[#2A3142] bg-[#141821]
                p-5
                hover:border-[#3A455C] hover:bg-[#171C26]
                transition
              "
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Image src="/icons/eu.svg" alt="EU" width={18} height={18} />
                  <span className="text-[11px] uppercase tracking-wide text-[#9AA3B2]">
                    {label}
                  </span>
                </div>

                <div className="text-[11px] text-[#9AA3B2]">
                  {(it.source ?? "EU") + (it.year ? ` • ${it.year}` : "")}
                </div>
              </div>

              <h3 className="mt-3 text-base font-semibold text-white leading-snug line-clamp-3">
                {it.title}
              </h3>

              {it.summary ? (
                <p className="mt-2 text-sm text-[#9AA3B2] leading-relaxed line-clamp-3">
                  {it.summary}
                </p>
              ) : (
                <p className="mt-2 text-sm text-[#9AA3B2] leading-relaxed line-clamp-3">
                  Official EU material relevant to employment fairness, evidence-based policy, and anti-discrimination.
                </p>
              )}

              <div className="mt-4">
                <a
                  href={it.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:underline"
                >
                  Read original <span aria-hidden="true">→</span>
                </a>
              </div>

              {it.tag ? (
                <div className="mt-3">
                  <span className="inline-flex rounded-full border border-[#2A3142] bg-[#0B0F14] px-2 py-0.5 text-[11px] text-[#E6E8EB]">
                    {it.tag}
                  </span>
                </div>
              ) : null}
            </article>
          ))}
        </div>

        {/* dots */}
        <div className="mt-1 flex items-center justify-center gap-2">
          {normalized.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to item ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={[
                "h-2 w-2 rounded-full transition",
                i === index ? "bg-white" : "bg-[#2A3142] hover:bg-[#3A455C]",
              ].join(" ")}
            />
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-[#6F7A8C]">
        External links lead to official EU publications. Summaries are provided by JunkedOut for contextual reference.
      </p>
    </section>
  );
}

