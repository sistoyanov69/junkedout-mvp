export default function InsightsPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold">Insights</h1>
          <p className="text-gray-300">
            Early, aggregated signals from submitted hiring experiences. This is a DEV view —
            content and metrics will evolve as data grows.
          </p>
        </header>

        {/* MVP: placeholder “active content” block.
            Next step: replace this with real aggregated stats from Supabase. */}
        <section className="border border-gray-800 rounded-2xl p-6 bg-gray-950/40">
          <h2 className="text-xl font-semibold mb-4">Live Snapshot (MVP)</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-400">
                <tr className="border-b border-gray-800">
                  <th className="py-3 pr-4">Metric</th>
                  <th className="py-3 pr-4">Value</th>
                  <th className="py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="text-gray-200">
                <tr className="border-b border-gray-900">
                  <td className="py-3 pr-4">Total submissions</td>
                  <td className="py-3 pr-4">—</td>
                  <td className="py-3 text-gray-400">Will be computed from Supabase.</td>
                </tr>
                <tr className="border-b border-gray-900">
                  <td className="py-3 pr-4">Top countries</td>
                  <td className="py-3 pr-4">—</td>
                  <td className="py-3 text-gray-400">Will be computed from country field.</td>
                </tr>
                <tr className="border-b border-gray-900">
                  <td className="py-3 pr-4">Top roles</td>
                  <td className="py-3 pr-4">—</td>
                  <td className="py-3 text-gray-400">Will be computed from role field.</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Most reported patterns</td>
                  <td className="py-3 pr-4">—</td>
                  <td className="py-3 text-gray-400">Later: classified tags + moderation.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Next: connect this page to real aggregates (counts + grouped stats) from Supabase. No
            personal data will be shown.
          </p>
        </section>
      </div>
    </main>
  );
}
