import { InfoTabs } from "@/components/info-tabs";

export default function InfoPage() {
  return (
    <main className="paper-grid min-h-screen px-6 pb-24 pt-16 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[.3em] text-[#e87561]">
          The practical guide
        </p>
        <h1 className="mt-5 max-w-2xl text-5xl font-bold leading-none tracking-[-.04em] sm:text-7xl">
          Everything in
          <br />
          <span className="text-[#e87561]">one place.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#53635f]">
          Fees and booklists for every chapter of GREATER TOMORROW SCHOOLS.
        </p>
        <InfoTabs />
      </div>
    </main>
  );
}
