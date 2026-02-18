// app/page.tsx
import Link from 'next/link';
import EUContextCarousel from "@/components/EUContextCarousel";
import { euContextItems } from "@/content/eu-context";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#E6E8EB]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[#2A3142] bg-[#0B0D10]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md border border-[#3B455C] bg-[#141821] grid place-items-center">
              <span className="text-sm font-semibold tracking-wide">JO</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">JunkedOut</div>
              <div className="text-xs text-[#9AA3B2]">Evidence-first hiring transparency</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/insights"
              className="text-sm text-[#9AA3B2] hover:text-[#E6E8EB] transition"
            >
              Insights
            </Link>
            <Link href="/submit" className="text-sm text-[#9AA3B2] hover:text-[#E6E8EB] transition">
              Submit
            </Link>
            <a href="#about" className="text-sm text-[#9AA3B2] hover:text-[#E6E8EB] transition">
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/submit"
              className="rounded-md bg-[#4DA3FF] px-4 py-2 text-sm font-semibold text-black hover:bg-[#6CB6FF] transition"
            >
              Submit Experience
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-12 md:items-center">
          <div className="md:col-span-7">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Turn hiring experiences into <span className="text-[#4DA3FF]">reliable evidence</span>
              .
            </h1>

            <p className="mt-5 text-lg text-[#9AA3B2]">
              JunkedOut collects real-world hiring journeys—timelines, steps, and outcomes—to expose
              systemic unfairness without exposing personal data.
            </p>

            {/* Warm micro-callout (EU-like “warm spot”) */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#F5C84B]/30 bg-[#F5C84B]/10 px-3 py-2 text-sm text-[#F5C84B]">
              <span className="h-2 w-2 rounded-full bg-[#F5C84B]" />
              Built for factual reporting — not drama.
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center rounded-md bg-[#4DA3FF] px-5 py-3 text-sm font-semibold text-black hover:bg-[#6CB6FF] transition"
              >
                Submit an experience
              </Link>

              <Link
                href="/insights"
                className="inline-flex items-center justify-center rounded-md border border-[#3B455C] bg-transparent px-5 py-3 text-sm font-semibold text-[#E6E8EB] hover:bg-[#141821] transition"
              >
                View insights & stats
              </Link>
            </div>

            {/* Chips */}
            <div className="mt-8 flex flex-wrap gap-3 text-xs">
              {/* Highlighted chips (warm) */}
              <span className="rounded-full border border-[#F5C84B]/40 bg-[#F5C84B]/10 px-3 py-1 text-[#F5C84B]">
                EU-first scope
              </span>
              <span className="rounded-full border border-[#F5C84B]/40 bg-[#F5C84B]/10 px-3 py-1 text-[#F5C84B]">
                Evidence-based reporting
              </span>
              <span className="rounded-full border border-[#F5C84B]/40 bg-[#F5C84B]/10 px-3 py-1 text-[#F5C84B]">
                GDPR-aware prompts
              </span>

              {/* Neutral chips */}
              <span className="rounded-full border border-[#2A3142] bg-[#141821] px-3 py-1 text-[#9AA3B2]">
                Anonymous by default
              </span>
              <span className="rounded-full border border-[#2A3142] bg-[#141821] px-3 py-1 text-[#9AA3B2]">
                Minimal personal data
              </span>
              <span className="rounded-full border border-[#2A3142] bg-[#141821] px-3 py-1 text-[#9AA3B2]">
                Method over opinions
              </span>
            </div>
          </div>

          {/* Right-side credibility panel */}
          <div className="md:col-span-5">
            <div className="rounded-xl border border-[#2A3142] bg-[#141821] p-6 shadow-sm">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-sm font-semibold">What we collect</div>
                  <div className="mt-1 text-sm text-[#9AA3B2]">
                    Process facts, not personal identities.
                  </div>
                </div>
                <div className="rounded-md border border-[#3B455C] bg-[#0B0D10] px-3 py-1 text-xs text-[#9AA3B2]">
                  MVP
                </div>
              </div>

              <ul className="mt-5 space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#4DA3FF]" />
                  <span className="text-[#E6E8EB]">Company, role, country, and timeline</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#4DA3FF]" />
                  <span className="text-[#E6E8EB]">Steps taken (ATS, interviews, tests)</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#4DA3FF]" />
                  <span className="text-[#E6E8EB]">Outcome + optional evidence reference</span>
                </li>
              </ul>

              <div className="mt-6 rounded-lg border border-[#2A3142] bg-[#0B0D10] p-4">
                <div className="text-xs font-semibold text-[#9AA3B2]">Privacy rule</div>
                <div className="mt-1 text-sm text-[#E6E8EB]">
                  No names, phone numbers, email addresses, or home addresses in the story text.
                </div>
                <div className="mt-2 text-xs text-[#6B7280]">
                  (Email is optional and stored only if the user requests follow-up.)
                </div>
              </div>

              {/* Small warm footer label */}
              <div className="mt-5 text-xs text-[#F5C84B]">
                Warm spots = highlights only. Core UI stays neutral.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signals section */}
      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold">Signals we want to measure</h2>
            <p className="mt-2 text-sm text-[#9AA3B2]">
              The point is not “naming and shaming.” The point is detecting patterns that remain
              invisible in individual cases.
            </p>
          </div>
          <Link
            href="/insights"
            className="hidden text-sm font-semibold text-[#4DA3FF] hover:text-[#6CB6FF] transition md:inline"
          >
            See all insights →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Auto-reject velocity',
              desc: 'How fast rejections happen after applying (minutes vs days).',
              tag: 'ATS signal',
            },
            {
              title: 'Interview funnel drop-offs',
              desc: 'Where candidates drop: screening, tests, final rounds.',
              tag: 'Process friction',
            },
            {
              title: 'Consistency vs policy',
              desc: 'Whether “equal opportunity” wording matches observed outcomes.',
              tag: 'Integrity check',
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-xl border border-[#2A3142] bg-[#141821] p-5 hover:bg-[#1B2130] transition"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold">{c.title}</div>

                {/* Warm tag badge */}
                <div className="rounded-full border border-[#F5C84B]/30 bg-[#F5C84B]/10 px-3 py-1 text-xs text-[#F5C84B]">
                  {c.tag}
                </div>
              </div>
              <p className="mt-3 text-sm text-[#9AA3B2]">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 md:hidden">
          <Link
            href="/insights"
            className="text-sm font-semibold text-[#4DA3FF] hover:text-[#6CB6FF] transition"
          >
            See all insights →
          </Link>
        </div>
      </section>

<EUContextCarousel items={euContextItems} />

      {/* Latest experiences preview (static placeholder for now) */}
      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="rounded-xl border border-[#2A3142] bg-[#141821] p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Recent submissions</h2>
              <p className="mt-2 text-sm text-[#9AA3B2]">
                Preview only. We’ll wire this to the database next (read-only, privacy-safe).
              </p>
            </div>
            <Link
              href="/submit"
              className="inline-flex items-center justify-center rounded-md border border-[#3B455C] bg-transparent px-4 py-2 text-sm font-semibold text-[#E6E8EB] hover:bg-[#1B2130] transition"
            >
              Add yours →
            </Link>
          </div>

          <div className="mt-6 grid gap-3">
            {[
              {
                meta: 'EU • Tech • Senior role',
                title: 'Rejected in 3 minutes after ATS screening',
                text: 'Applied via company portal. Automated rejection arrived before a human interview could plausibly occur.',
              },
              {
                meta: 'EU • Finance • Management',
                title: 'Four interviews, then “position closed”',
                text: 'Completed multiple rounds including stakeholder panel. Hiring stopped with no feedback despite request.',
              },
              {
                meta: 'EU • Engineering • Mid/Senior',
                title: 'Skills match, yet generic rejection pattern',
                text: 'Role reposted repeatedly. Rejection templates identical across months.',
              },
            ].map((x) => (
              <div key={x.title} className="rounded-lg border border-[#2A3142] bg-[#0B0D10] p-4">
                <div className="text-xs text-[#6B7280]">{x.meta}</div>
                <div className="mt-1 text-sm font-semibold">{x.title}</div>
                <div className="mt-1 text-sm text-[#9AA3B2]">{x.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Mission */}
      <section id="about" className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="text-2xl font-semibold">Why JunkedOut exists</h2>
            <p className="mt-3 text-sm text-[#9AA3B2] leading-relaxed">
              Hiring is full of strong claims—fairness, equal opportunity, transparent processes—yet
              candidates often observe the opposite. JunkedOut is designed to convert scattered
              experiences into structured, comparable evidence while minimizing personal data.
            </p>

            <div className="mt-5 rounded-lg border border-[#2A3142] bg-[#141821] p-5">
              <div className="text-sm font-semibold">Our posture</div>
              <ul className="mt-3 space-y-2 text-sm text-[#9AA3B2]">
                <li>• We document processes, not identities.</li>
                <li>• We prioritize verifiable facts and patterns.</li>
                <li>• We keep the bar high: fewer claims, stronger evidence.</li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="rounded-xl border border-[#2A3142] bg-[#141821] p-6">
              <div className="text-sm font-semibold">Help us start clean</div>
              <p className="mt-2 text-sm text-[#9AA3B2]">
                The MVP focuses on collecting structured submissions safely. We will add read-only
                public views after we confirm privacy rules.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/submit"
                  className="rounded-md bg-[#4DA3FF] px-5 py-3 text-sm font-semibold text-black hover:bg-[#6CB6FF] transition text-center"
                >
                  Submit Experience
                </Link>
                <Link
                  href="/insights"
                  className="rounded-md border border-[#3B455C] px-5 py-3 text-sm font-semibold hover:bg-[#1B2130] transition text-center"
                >
                  Insights (table)
                </Link>
              </div>

              <div className="mt-6 text-xs text-[#6B7280]">
                Tip: If you’re unsure whether your text includes personal data, keep it generic and
                focus on the process steps + dates.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A3142] bg-[#0B0D10]">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-[#6B7280]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="text-[#9AA3B2]">JunkedOut</span> • Anonymous • GDPR-aware •
              Evidence-based
            </div>
            <div className="flex gap-4">
              <Link href="/submit" className="hover:text-[#E6E8EB] transition">
                Submit
              </Link>
              <Link href="/insights" className="hover:text-[#E6E8EB] transition">
                Insights
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
