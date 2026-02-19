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

function getLink(it: EUContextItem): string {
  // Support either `href` or `url` depending on the content schema.
  if ("href" in it && typeof it.href === "string") return it.href;
  if ("url" in it && typeof it.url === "string") return it.url;
  return "";
}

function getText(it: EUContextItem, key: string): string {
  if (key in it) {
    const v = (it as unknown as Record<string, unknown>)[key];
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
  }
  return "";
}

export default function EUContextCarousel({
  items,
  title = "EU Context We Build Upon",
  subtitle = "Selected official EU materials that shape our design and policy alignment.",
  autoplayMs = 6500,
}: Props) {
  const safeItems = useMemo(() => (items ?? []).filter(Boolean), [items]);
  const total = safeItems.length;

  const [visible, setVisible] = useState(3);
  const [index, setIndex] = useState(0);

  const hoveringRef = useRef(false);

  useEffect(() => {
    if (total <= 0) return;
    setIndex((i) => clamp(i, 0, Math.max(0, total - 1)));
  }, [total]);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1024) setVisible(3);
      else if (w >= 768) setVisible(2);
      else setVisible(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (total <= 1) return;
    const t = window.setInterval(() => {
      if (hoveringRef.current) return;
      setIndex((i) => (i + 1) % total);
    }, autoplayMs);
    return () => window.clearInterval(t);
  }, [autoplayMs, total]);

  const go = (i: number) => {
    if (total <= 0) return;
    const next = ((i % total) + total) % total;
    setIndex(next);
  };

  const prev = () => go(index - 1);
  const next = () => go(index + 1);

  const slideW = 100 / Math.max(1, visible);
  const translatePct = index * slideW;

  return (
    <section
      className="mx-auto w-full max-w-6xl px-6 pb-10"
      onMouseEnter={() => {
        hoveringRef.current = true;
      }}
      onMouseLeave={() => {
        hoveringRef.current = false;
      }}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm text-[#9AA3B2]">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden text-xs text-[#9AA3B2] sm:block">
            {total > 0 ? `${index + 1} / ${total}` : "—"}
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
              const t = getText(it, "title");
              const summary = getText(it, "summary");
              const year = getText(it, "year");
              const source = getText(it, "source");
              const tag = getText(it, "tag");

              return (
                <div
                  key={`${link || "item"}-${i}`}
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
                            {(source || "European Union") + (year ? ` • ${year}` : "")}
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
                      {t}
                    </h3>

                    <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-[#9AA3B2]">
                      {summary}
                    </p>

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
            const active = i === index;
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

