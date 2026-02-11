// app/copper/page.tsx
import Link from 'next/link';

const ACCENT = {
  name: 'copper',
  // Tailwind palette choices for “copper-like” warm accent:
  // Feel free to tweak later (e.g. orange -> amber -> yellow).
  text: 'text-orange-300',
  textStrong: 'text-orange-200',
  border: 'border-orange-400/40',
  bgSoft: 'bg-orange-500/10',
  ring: 'ring-orange-400/25',
  dot: 'bg-orange-300',
  hoverBg: 'hover:bg-orange-500/15',
};

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs',
        'border bg-white/5',
        ACCENT.border,
        ACCENT.text,
      ].join(' ')}
    >
      <span className={['h-2 w-2 rounded-full', ACCENT.dot].join(' ')} />
      {children}
    </span>
  );
}

function Tag({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">{children}</h3>
        <span
          className={[
            'rounded-full border px-3 py-1 text-xs',
            ACCENT.border,
            ACCENT.text,
            ACCENT.bgSoft,
          ].join(' ')}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

export default function CopperHome() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Top nav */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 bg-white/5 font-semibold">
              JO
            </div>
            <div className="leading-tight">
              <div className="font-semibold">JunkedOut</div>
              <div className="text-xs text-white/60">
                Evidence-first hiring transparency (Copper)
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <Link href="/insights" className="hover:text-white">
              Insights
            </Link>
            <Link href="/submit" className="hover:text-white">
              Submit
            </Link>
            <Link href="/about" className="hover:text-white">
              About
            </Link>
          </nav>

          <Link
            href="/submit"
            className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-semibold text-black hover:bg-sky-300"
          >
            Submit Experience
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-2">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Turn hiring experiences into <span className="text-sky-400">reliable evidence</span>.
          </h1>

          <p className="text-white/70">
            JunkedOut collects real-world hiring journeys—timelines, steps, and outcomes—to expose
            systemic unfairness without exposing personal data.
          </p>

          {/* Warm spot callout */}
          <div
            className={[
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm',
              'bg-white/5',
              ACCENT.border,
              ACCENT.text,
            ].join(' ')}
          >
            <span className={['h-2 w-2 rounded-full', ACCENT.dot].join(' ')} />
            Built for factual reporting — not drama.
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/submit"
              className="rounded-lg bg-sky-400 px-5 py-3 font-semibold text-black hover:bg-sky-300"
            >
              Submit an experience
            </Link>

            <Link
              href="/insights"
              className="rounded-lg border border-white/20 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
            >
              View insights & stats
            </Link>
          </div>

          {/* Chips (accented) */}
          <div className="flex flex-wrap gap-2 pt-3">
            <Chip>EU-first scope</Chip>
            <Chip>Evidence-based reporting</Chip>
            <Chip>GDPR-aware prompts</Chip>
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
              Anonymous by default
            </span>
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
              Minimal personal data
            </span>
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
              Method over opinions
            </span>
          </div>
        </div>

        {/* Right card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white">What we collect</div>
              <div className="text-sm text-white/70">Process facts, not personal identities.</div>
            </div>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
              MVP
            </span>
          </div>

          <ul className="mt-5 space-y-3 text-sm text-white/80">
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
              Company, role, country, and timeline
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
              Steps taken (ATS, interviews, tests)
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
              Outcome + optional evidence reference
            </li>
          </ul>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs font-semibold text-white/80">Privacy rule</div>
            <div className="mt-1 text-sm text-white">
              No names, phone numbers, email addresses, or home addresses in the story text.
            </div>
            <div className="mt-2 text-xs text-white/60">
              (Email is optional and stored only if the user requests follow-up.)
            </div>
          </div>

          <div className={['mt-5 text-xs', ACCENT.text].join(' ')}>
            Copper accents = highlights only. Core UI stays neutral.
          </div>
        </div>
      </section>

      {/* Signals */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold">Signals we want to measure</h2>
            <p className="mt-2 text-sm text-white/70">
              This platform is not about “naming and shaming.” It is about detecting patterns that
              remain invisible in individual cases.
            </p>
          </div>

          <Link href="/insights" className="text-sm text-sky-400 hover:underline">
            See all insights →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Tag label="ATS signal">Auto-reject velocity</Tag>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/70">
              How fast rejections happen after applying (minutes vs days).
            </div>
          </div>

          <Tag label="Process friction">Interview funnel drop-offs</Tag>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/70">
              Where candidates drop: screening, tests, final rounds.
            </div>
          </div>

          <Tag label="Integrity check">Consistency vs policy</Tag>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/70">
              Whether “equal opportunity” wording matches observed outcomes.
            </div>
          </div>
        </div>

        {/* Footer strip */}
        <div className={['mt-10 rounded-2xl border p-6', 'bg-white/5 border-white/10'].join(' ')}>
          <div className="text-sm text-white/70">
            Next: plug “Recent submissions” here as a live section (your current table page can be
            embedded/linked).
          </div>
        </div>
      </section>
    </main>
  );
}
