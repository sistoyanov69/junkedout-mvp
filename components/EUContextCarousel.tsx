"use client";

import { useMemo, useState } from "react";
import type { EUContextItem } from "@/content/eu-context";

type Props = {
  items: EUContextItem[];
};

export default function EUContextCarousel({ items }: Props) {
  const safeItems = useMemo(() => items.filter(Boolean), [items]);
  const [i, setI] = useState(0);

  if (safeItems.length === 0) return null;

  const current = safeItems[i];

  function prev() {
    setI((x) => (x - 1 + safeItems.length) % safeItems.length);
  }

  function next() {
    setI((x) => (x + 1) % safeItems.length);
  }

  return (
    <section className="mt-10">
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
          >
            ←
          </button>
          <button
            type="button"
            onClick={next}
            className="px-3 py-2 rounded border border-gray-700 hover:border-gray-500"
            aria-label="Next"
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-gray-800 bg-gray-950/40 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <img
                src="/icons/eu.svg"
                alt="EU"
                className="h-4 w-4"
                loading="lazy"
              />
              <span>
                {current.source} · {current.year} · {current.tag}
              </span>
            </div>

            <h3 className="mt-2 text-lg font-semibold text-white break-words">
              {current.title}
            </h3>

            <p className="mt-2 text-sm text-gray-300 leading-relaxed">
              {current.summary}
            </p>

            <a
              href={current.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex mt-3 text-sm underline text-gray-200 hover:text-white"
            >
              Read EU source →
            </a>
          </div>

          <div className="hidden md:flex flex-col items-end gap-2">
            <div className="text-xs text-gray-500">
              {i + 1} / {safeItems.length}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          {safeItems.map((_, idx) => (
            <button
              key={safeItems[idx].id}
              type="button"
              onClick={() => setI(idx)}
              className={`h-2.5 w-2.5 rounded-full ${
                idx === i ? "bg-gray-200" : "bg-gray-700 hover:bg-gray-600"
              }`}
              aria-label={`Go to item ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        External links lead to official EU publications. Summaries are provided by JunkedOut for contextual reference.
      </p>
    </section>
  );
}
