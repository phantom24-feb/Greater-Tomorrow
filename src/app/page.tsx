import Link from "next/link";

const links = [
  {
    href: "/results",
    number: "01",
    title: "Check results",
    text: "A calm, private way to see your learner's latest report.",
  },
  {
    href: "/info#fees",
    number: "02",
    title: "Tuition & fees",
    text: "Find the right class and plan the term ahead.",
  },
  {
    href: "/info#books",
    number: "03",
    title: "Booklists",
    text: "Everything learners need, organised by class.",
  },
];

export default function Home() {
  return (
    <main className="paper-grid min-h-[calc(100vh-88px)] overflow-hidden">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12 lg:grid-cols-[1.2fr_.8fr] lg:px-10 lg:pb-28 lg:pt-20">
        <div className="self-center">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[.25em] text-[#e87561] sm:mb-6 sm:text-xs sm:tracking-[.3em]">
            Nursery · Primary · Secondary
          </p>
          <h1 className="max-w-3xl text-5xl font-bold leading-[.94] tracking-[-.05em] sm:text-8xl">
            Small steps.
            <br />
            <span className="text-[#e87561]">Wide horizons.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#53635f] sm:mt-8 sm:text-lg sm:leading-8">
            GREATER TOMORROW SCHOOLS is a warm, curious school where children
            are known by name and encouraged to find their own bright way
            forward.
          </p>
          <Link
            href="/info"
            className="mt-7 inline-flex items-center gap-3 border-b-2 border-[#18302d] pb-2 font-bold sm:mt-9"
          >
            Explore school life <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="relative flex min-h-[300px] items-center justify-center rounded-[1.5rem] bg-[#cfe2d8] p-6 sm:min-h-[390px] sm:rounded-[2rem] sm:p-10 lg:min-h-[500px]">
          <div className="absolute right-4 top-4 rounded-full bg-[#f5c85b] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest sm:right-7 sm:top-7 sm:px-4 sm:py-2 sm:text-xs">
            <span>Since 2001</span>
          </div>
          <div className="flex h-52 w-52 rotate-[-6deg] items-center justify-center rounded-[45%_55%_50%_45%] border-[10px] border-[#fffdf8] bg-[#e87561] text-center text-[#fffdf8] shadow-[9px_10px_0_#18302d] sm:h-64 sm:w-64 sm:border-[14px] sm:shadow-[12px_14px_0_#18302d] lg:h-80 lg:w-80">
            <div>
              <div className="text-7xl font-bold leading-none sm:text-8xl">
                E
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-[.25em] sm:text-sm sm:tracking-[.3em]">
                Learn brightly
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[.25em] text-[#e87561]">
              Your shortcuts
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              The useful stuff
            </h2>
          </div>
          <span className="hidden text-sm text-[#53635f] sm:block">
            Open all year, wherever you are.
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-[#18302d]/15 bg-[#fffdf8] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#e87561] hover:shadow-[5px_5px_0_#f5c85b]"
            >
              <span className="text-xs font-bold text-[#e87561]">
                {link.number}
              </span>
              <h3 className="mt-12 text-xl font-bold">
                {link.title}{" "}
                <span className="float-right transition-transform group-hover:translate-x-1">
                  ↗
                </span>
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#53635f]">
                {link.text}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
