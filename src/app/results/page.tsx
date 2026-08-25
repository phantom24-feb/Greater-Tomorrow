import { ResultLookup } from "@/components/result-lookup";

export default function ResultsPage() {
  return (
    <main className="paper-grid min-h-screen px-6 pb-24 pt-16 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:pt-14">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.3em] text-[#e87561]">
            Learner portal
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-none tracking-[-.04em] sm:text-7xl">
            A little
            <br />
            <span className="text-[#e87561]">progress.</span>
          </h1>
          <p className="mt-7 max-w-sm leading-7 text-[#53635f]">
            Enter the details on your report card to view your latest result
            securely.
          </p>
        </div>
        <ResultLookup />
      </div>
    </main>
  );
}
