function ArrowUpRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-0 transition-opacity group-hover:opacity-100"
      aria-hidden="true"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

const portfolioItems = [
  {
    id: 1,
    title: "Typeface Analytics",
    description:
      "A dashboard for analyzing web typography legibility across different viewports.",
    year: "2025",
    role: "Design & Engineering",
  },
  {
    id: 2,
    title: "Monochrome Theme",
    description:
      "An ultra-minimalist, high-contrast theme developed for VS Code and standard IDEs.",
    year: "2024",
    role: "Creator",
  },
  {
    id: 3,
    title: "Ockham",
    description:
      "A distraction-free writing application that removes features as you write.",
    year: "2024",
    role: "Lead Developer",
  },
];

export default function PortfolioPage() {
  return (
    <div className="animate-fade-in">
      <h2 className="mb-12 text-2xl font-medium tracking-tight">
        Selected Works
      </h2>
      <div className="flex flex-col gap-16">
        {portfolioItems.map((item) => (
          <article key={item.id} className="group cursor-pointer">
            <div className="mb-4 flex items-baseline justify-between border-b border-black pb-4">
              <h3 className="flex items-center gap-2 text-xl font-medium decoration-2 underline-offset-4 group-hover:underline">
                {item.title}
                <ArrowUpRight />
              </h3>
              <span className="text-sm">{item.year}</span>
            </div>
            <p className="max-w-xl text-lg leading-relaxed">{item.description}</p>
            <p className="mt-4 text-sm font-medium uppercase tracking-widest">
              {item.role}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
