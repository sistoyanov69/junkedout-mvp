export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Top section */}
      <section className="px-6 pt-16 pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Anonymous • GDPR-aware • Evidence-based
              </p>

              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                JunkedOut
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl">
                JunkedOut empowers candidates by collecting and analyzing real
                hiring experiences to expose hidden systemic unfairness based on
                reliable data, and promote humane, transparent recruitment.
              </p>

              <div className="flex flex-wrap gap-4 pt-3">
                <a
                  href="/submit"
                  className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Submit experience
                </a>

                <a
                  href="/insights"
                  className="px-6 py-3 border border-white rounded-lg hover:bg-white hover:text-black transition"
                >
                  Explore insights
                </a>
              </div>

              <p className="text-xs text-gray-500">
                MVP note: submissions are stored, and insights will be expanded
                as the dataset grows.
              </p>
            </div>

            {/* Trust / how it works */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border border-gray-800 rounded-2xl p-5 bg-gray-950/40">
                <h3 className="font-semibold mb-2">What people submit</h3>
                <p className="text-sm text-gray-300">
                  Companies, agencies, role, country, and a short narrative of
                  what happened — plus optional evidence pointers.
                </p>
              </div>

              <div className="border border-gray-800 rounded-2xl p-5 bg-gray-950/40">
                <h3 className="font-semibold mb-2">What we publish</h3>
                <p className="text-sm text-gray-300">
                  Aggregated patterns and trends — not personal data. The goal is
                  transparency through methodology, not drama.
                </p>
              </div>

              <div className="border border-gray-800 rounded-2xl p-5 bg-gray-950/40">
                <h3 className="font-semibold mb-2">How we keep it safe</h3>
                <p className="text-sm text-gray-300">
                  Consent-based submissions, minimal personal data, and a
                  moderation-first approach before public datasets expand.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems section */}
      <section className="px-6 py-10 border-t border-gray-900">
        <div className="max-w-5xl mx-auto space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            Hiring practices worth documenting
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: "Ghosting and silent rejection",
                text: "No response, no closure, and no actionable feedback after interviews or tests.",
              },
              {
                title: "Automated filtering and opaque ATS rules",
                text: "CVs rejected instantly with no explanation, often before a human review.",
              },
              {
                title: "Fake or recycled vacancies",
                text: "Positions that appear repeatedly while candidates are rejected at scale.",
              },
              {
                title: "Endless loops and moving goalposts",
                text: "Multiple rounds with shifting requirements, unpaid tasks, or ambiguous criteria.",
              },
            ].map((x) => (
              <div
                key={x.title}
                className="border border-gray-800 rounded-2xl p-5 bg-gray-950/40"
              >
                <h3 className="font-semibold mb-2">{x.title}</h3>
                <p className="text-sm text-gray-300">{x.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Embedded “active content” teaser */}
      <section className="px-6 py-10 border-t border-gray-900">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h2 className="text-2xl md:text-3xl font-bold">
              Active insights (MVP)
            </h2>

            <a
              href="/insights"
              className="text-sm text-gray-300 underline hover:text-white"
            >
              Open full insights →
            </a>
          </div>

          <div className="border border-gray-800 rounded-2xl p-6 bg-gray-950/40">
            <p className="text-gray-300">
              This section will display live, aggregated statistics (counts,
              top countries, top roles, and trend snapshots). For now, the full
              view is available on the Insights page.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="/insights"
                className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                View insights
              </a>
              <a
                href="/submit"
                className="px-4 py-2 border border-white rounded-lg hover:bg-white hover:text-black transition"
              >
                Add your experience
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-gray-900">
        <div className="max-w-5xl mx-auto text-sm text-gray-500 flex flex-col gap-2">
          <p>
            JunkedOut is built to prioritize method, privacy, and aggregated
            evidence.
          </p>
          <p>
            Next milestones: real aggregated metrics, moderation workflow, and
            dev/prod data separation.
          </p>
        </div>
      </footer>
    </main>
  );
}
