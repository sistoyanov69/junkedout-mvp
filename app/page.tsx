export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-3xl text-center space-y-6">

        <h1 className="text-4xl md:text-5xl font-bold">
          JunkedOut
        </h1>

        <p className="text-xl text-gray-300">
          Exposing hidden systemic unfairness in hiring
          through reliable, real-world data.
        </p>

        <p className="text-gray-400">
          JunkedOut empowers candidates by collecting and analyzing
          real hiring experiences to promote humane, transparent recruitment.
        </p>

        <div className="flex justify-center gap-4 mt-6">

          <a
            href="#"
            className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Submit Experience
          </a>

          <a
            href="#"
            className="px-6 py-3 border border-white rounded-lg hover:bg-white hover:text-black transition"
          >
            Learn More
          </a>

        </div>

        <p className="text-sm text-gray-500 mt-8">
          Anonymous • GDPR-aware • Evidence-based
        </p>

      </div>
    </main>
  );
}

