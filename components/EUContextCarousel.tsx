'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { EUContextItem } from '@/content/eu-context';

export default function EUContextCarousel({ items }: { items: EUContextItem[] }) {
  const VISIBLE = 3;
  const INTERVAL_MS = 7000;

  const safeItems = (items ?? []).filter(Boolean);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    if (safeItems.length <= VISIBLE) return;

    const id = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % safeItems.length);
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [safeItems.length]);

  if (safeItems.length === 0) return null;

  const visibleItems = Array.from({ length: Math.min(VISIBLE, safeItems.length) }).map((_, i) => {
    const index = (startIndex + i) % safeItems.length;
    return safeItems[index];
  });

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold">EU Context We Build Upon</h2>
        <p className="mt-2 text-sm text-[#9AA3B2]">
          Selected official EU materials that shape our design and policy alignment.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {visibleItems.map((item, idx) => (
          <article
            key={`${item.id}-${idx}`}
            className="rounded-lg border border-[#2A3142] bg-[#141821] p-5 transition hover:border-[#3B455C]"
          >
            <div className="mb-3 flex items-center gap-2">
              <Image src="/icons/eu.svg" alt="EU" width={18} height={18} />
              <span className="text-xs uppercase tracking-wide text-[#9AA3B2]">
                {item.source} · {item.year} · {item.tag}
              </span>
            </div>

            <h3 className="text-base font-semibold leading-snug">{item.title}</h3>

            <p className="mt-2 text-sm text-[#B8C0CC]">{item.summary}</p>

            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-semibold text-[#E6E8EB] hover:underline"
            >
              Read original →
            </a>
          </article>
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-500">
        External links lead to official EU publications. Summaries are provided by JunkedOut for contextual reference.
      </p>
    </section>
  );
}

