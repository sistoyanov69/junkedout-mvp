// app/about/page.tsx
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <header className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center font-semibold">
              JO
            </div>
            <div>
              <div className="text-lg font-semibold leading-tight">JunkedOut</div>
              <div className="text-sm text-white/60">
                Evidence-first transparency for hiring practices in Europe
              </div>
            </div>
          </div>

          <h1 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-tight">
            About JunkedOut
          </h1>

          <p className="max-w-3xl text-white/75 leading-relaxed">
            JunkedOut is a public-interest initiative that turns real hiring journeys into structured,
            privacy-aware evidence. The goal is simple: make systemic exclusion visible and measurable,
            across companies, sectors, and countries — so that policy, oversight, and public debate can
            rely on data rather than anecdotes.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/submit"
              className="inline-flex items-center justify-center rounded-lg bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90"
            >
              Submit an experience
            </Link>
            <Link
              href="/insights"
              className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              View insights
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5"
            >
              Back to home
            </Link>
          </div>
        </header>

        <section className="mt-12 grid gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">What the platform is</h2>
            <p className="mt-2 text-white/75 leading-relaxed">
              A GDPR-aware reporting flow that captures process facts (timeline, steps, outcomes) and
              allows optional evidence references — without collecting unnecessary personal identifiers.
              The platform is built to aggregate signals over time and publish only when meaningful
              statistical thresholds are reached.
            </p>

            <ul className="mt-4 grid gap-2 text-white/75">
              <li>• EU-wide scope from day one (cross-country comparability is the point).</li>
              <li>• Longitudinal evidence: track trends and the impact of policy changes over years.</li>
              <li>• Method over drama: structured inputs, consistent categories, reproducible outputs.</li>
              <li>• Public relevance: aggregated organisational-level insights once thresholds are met.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Why it matters</h2>
            <p className="mt-2 text-white/75 leading-relaxed">
              Labour-market exclusion often happens inside recruitment workflows: ATS filtering,
              procedural screening, opaque “fit” criteria, and inconsistent application of equal
              opportunity claims. These mechanisms rarely show up in official statistics until the
              damage is already done (long-term unemployment, early exit from the workforce, dependency
              on social support).
            </p>
            <p className="mt-3 text-white/75 leading-relaxed">
              JunkedOut’s purpose is to provide a reliable feedback loop: after policy changes,
              enforcement actions, or corporate commitments, we should be able to measure whether
              real outcomes improve — not just whether statements sound good.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Privacy and fairness principles</h2>
            <ul className="mt-3 grid gap-2 text-white/75 leading-relaxed">
              <li>
                • Data minimisation: collect what is needed to measure process behaviour, not personal identity.
              </li>
              <li>
                • Aggregation-first publication: insights are published at organisational level only when sample
                sizes are sufficient to avoid misleading interpretation.
              </li>
              <li>
                • Neutral presentation: focus on measurable signals (timing, funnel drop-offs, consistency),
                not personal attacks.
              </li>
              <li>
                • Evidence references optional: users may keep supporting material privately and share only if
                needed for follow-up.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Founder</h2>
            <p className="mt-2 text-white/75 leading-relaxed">
              The project is initiated by Stoyan Stoyanov (Sofia, Bulgaria), an engineering and IT leader
              with experience across large-scale enterprise systems, industrial automation, and software
              delivery. JunkedOut is built as a serious, long-term infrastructure project: clear method,
              strong governance, and measurable outcomes.
            </p>

            <div className="mt-4 grid gap-2 text-white/75">
              <div>• Company: JunkedOut EOOD (Bulgaria)</div>
              <div>
                • Contact:{" "}
                <a className="underline hover:text-white" href="mailto:founder@junkedout.org">
                  founder@junkedout.org
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Next steps</h2>
            <p className="mt-2 text-white/75 leading-relaxed">
              We are expanding data collection, improving validation and taxonomy, and building
              publication-ready dashboards that can support researchers, civil society, and policymakers.
              If you are a municipality, NGO, journalist, researcher, or funder interested in an evidence-first
              approach to labour-market fairness, we welcome contact.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center rounded-lg bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90"
              >
                Contribute data
              </Link>
              <a
                href="mailto:founder@junkedout.org"
                className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
              >
                Contact
              </a>
            </div>
          </div>
        </section>

        <footer className="mt-12 text-sm text-white/50">
          <div className="border-t border-white/10 pt-6">
            © {new Date().getFullYear()} JunkedOut. Built for accountability, not outrage.
          </div>
        </footer>
      </div>
    </main>
  );
}
