import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { SVGProps } from "react";
import { ArrowLeft, BarChart3, Bot, Layers } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CandlestickBackground from "@/components/CandlestickBackground";

function BlueberryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="9" cy="13" r="4.2" />
      <circle cx="14.5" cy="11" r="4.2" />
      <circle cx="14" cy="16.2" r="4.2" />
      <path d="M13 6c.8-1.2 2.2-2 3.8-2" strokeLinecap="round" />
      <path d="M12 7.2c-.8-1.3-2.4-2.2-4.4-2.2" strokeLinecap="round" />
    </svg>
  );
}

function BullIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path
        d="M6.5 9.5c-1.8 0-3-1.2-3-3 1.7 0 3 .7 3.6 2.1"
        strokeLinecap="round"
      />
      <path
        d="M17.5 9.5c1.8 0 3-1.2 3-3-1.7 0-3 .7-3.6 2.1"
        strokeLinecap="round"
      />
      <path
        d="M7.2 10.2c1.1-1.8 2.8-3 4.8-3s3.7 1.2 4.8 3c.8 1.3 1.2 2.8 1.2 4.4 0 3.3-2.7 6-6 6s-6-2.7-6-6c0-1.6.4-3.1 1.2-4.4Z"
        strokeLinejoin="round"
      />
      <path d="M9.4 14.2h.01M14.6 14.2h.01" strokeLinecap="round" />
      <path d="M10 17c.8.7 2 .7 2.8 0" strokeLinecap="round" />
    </svg>
  );
}

function BearIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M7.5 8.5c-1.7 0-3-1.3-3-3s1.3-3 3-3c.9 0 1.7.4 2.3 1" strokeLinecap="round" />
      <path d="M16.5 8.5c1.7 0 3-1.3 3-3s-1.3-3-3-3c-.9 0-1.7.4-2.3 1" strokeLinecap="round" />
      <path
        d="M12 9c4 0 7 2.7 7 6.4 0 3.1-2.6 5.6-7 5.6s-7-2.5-7-5.6C5 11.7 8 9 12 9Z"
        strokeLinejoin="round"
      />
      <path d="M9.4 14.2h.01M14.6 14.2h.01" strokeLinecap="round" />
      <path d="M11 16.2c.7.6 1.3.6 2 0" strokeLinecap="round" />
    </svg>
  );
}

interface AboutSection {
  id: string;
  title: string;
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  content: string[];
}

const ABOUT_SECTIONS: AboutSection[] = [
  {
    id: "blueberries",
    title: "500 Blueberries. 500 Trading Days.",
    icon: BlueberryIcon,
    content: [
      "One single blueberry doesn’t make you feel full.",
      "You can eat it in one second and forget about it.",
      "Yet one kilogram of blueberries, around 500 berries, is a completely different story.",
      "The same is true in trading.",
      "A single market movement often looks irrelevant.",
      "A small candle. A small push up. A small pullback.",
      "Easy to ignore. Easy to misinterpret. Easy to overreact to.",
      "But when you look at 500 trading days, almost two full trading years, a pattern starts to appear.",
      "And patterns are where decisions become power.",
      "One blueberry is small.",
      "500 blueberries tell a story.",
    ],
  },
  {
    id: "two-years",
    title: "Two years of real market behavior",
    icon: BarChart3,
    content: [
      "On average, the stock market is open for about 252 days per year.",
      "That means:",
      "500 trading days ≈ 2 years of real market behavior.",
      "Two years of: fear and confidence, overreaction and correction, accumulation and distribution, wrong narratives and late realizations.",
      "Just like blueberries…",
      "Some are small, some are big. Some are sweet, some are sour. Some look perfect but taste empty. Others look average and surprise you.",
      "Market movements behave exactly the same.",
      "Some days move the market only slightly. Some days change everything.",
      "Yet you only understand their real impact when you stop looking at them individually.",
      "A single movement rarely matters. The sequence does.",
      "No trader becomes consistently profitable because of one trade. And no strategy becomes strong because of one lucky prediction.",
    ],
  },
  {
    id: "edge",
    title: "The real edge: interpretation",
    icon: BullIcon,
    content: [
      "What really matters is the ability to index the movement of the market.",
      "To understand: Where is price moving? Why is it moving? What type of movement is this?",
      "And most importantly: What is the most probable next movement after the current one?",
      "This is the real edge.",
      "Not guessing the market. But interpreting its behavior.",
    ],
  },
  {
    id: "bullbeardays",
    title: "BullBearDays: structure over reaction",
    icon: Layers,
    content: [
      "BullBearDays is built around this exact idea.",
      "BullBearDays does not treat market days as isolated events.",
      "It treats every day as a blueberry inside a larger basket.",
      "Each scenario, bull or bear, becomes a data point inside a growing structure: contextualized, compared, and evaluated against what historically happened after similar situations.",
      "Because staying profitable is not about reacting faster. It is about staying one step ahead.",
    ],
  },
  {
    id: "ai",
    title: "AI changes who can trade, not what truly matters",
    icon: Bot,
    content: [
      "With AI, it is no longer about who is more intelligent.",
      "AI can help traders who are not deeply technical appear highly analytical, and help experienced traders become even sharper.",
      "AI does not replace judgment. It augments interpretation.",
      "It connects: price action, technical signals, contextual information, historical behavior, and probabilistic outcomes.",
      "In other words: AI makes it possible to turn 500 small blueberries into a meaningful meal.",
    ],
  },
  {
    id: "risk",
    title: "Predictability is risk awareness",
    icon: BearIcon,
    content: [
      "Markets will never be perfectly predictable. But they are measurable.",
      "Based on historical patterns, structural similarities and scenario alignment, it becomes possible to evaluate: how likely a move is, how fragile the setup is, and how asymmetric the opportunity really is.",
      "This is where risk becomes transparent.",
      "Not: “I feel it will go up.”",
      "But: “Based on similar structures, data context and scenario alignment, this decision has a higher probability to become profitable, and I know exactly what would invalidate it.”",
      "That is professional trading.",
      "The real goal is not to be right. The real goal is to be prepared.",
    ],
  },
  {
    id: "closing",
    title: "500 blueberries. One mindset.",
    icon: BlueberryIcon,
    content: [
      "Just like eating one blueberry will never change your energy level, watching one market candle will never make you a better trader.",
      "But learning how to interpret hundreds of movements, understanding how bull and bear scenarios unfold over time, and knowing how to react before the next move begins, that is what creates consistency.",
      "500 blueberries. 500 trading days. One mindset.",
      "Small moments do not look powerful on their own.",
      "But when you collect them, structure them, and learn how to read them, they become an advantage.",
      "BullBearDays exists to help you stay one step ahead of the next move, not by guessing, but by understanding.",
    ],
  },
];

const HIGHLIGHTED_LINES = new Set<string>([
  "A single movement rarely matters. The sequence does.",
  "Not guessing the market. But interpreting its behavior.",
  "BullBearDays exists to help you stay one step ahead of the next move, not by guessing, but by understanding.",
]);

function renderSectionBody(lines: string[]) {
  return lines.map((line, idx) => (
    HIGHLIGHTED_LINES.has(line) ? (
      <div
        key={`${idx}-${line.slice(0, 24)}`}
        className="rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-muted/10 to-transparent p-4"
      >
        <p className="text-sm md:text-base text-foreground font-medium leading-relaxed">{line}</p>
      </div>
    ) : (
      <p key={`${idx}-${line.slice(0, 24)}`} className="text-muted-foreground leading-relaxed">
        {line}
      </p>
    )
  ));
}

const About = () => {
  const introVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = document.title;
    document.title = "About | BullBearDays";
    return () => {
      document.title = t;
    };
  }, []);

  useEffect(() => {
    const el = introVideoRef.current;
    if (!el) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting && entry.intersectionRatio >= 1) {
          void el.play().catch(() => {
            // Autoplay can be blocked; user can still press Play via controls.
          });
          return;
        }

        el.pause();
      },
      { threshold: [1] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background relative text-foreground">
      <CandlestickBackground />

      <div className="relative z-10">
        <Header />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-44 pb-16 md:pt-52 md:pb-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-muted border border-border text-sm font-medium text-foreground mb-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <section className="relative mb-10 md:mb-14">
            <div
              className="absolute -top-10 left-1/4 w-[420px] h-[420px] bg-bullish/5 rounded-full blur-[120px] pointer-events-none"
              aria-hidden
            />
            <div
              className="absolute -top-10 right-1/4 w-[420px] h-[420px] bg-bearish/5 rounded-full blur-[120px] pointer-events-none"
              aria-hidden
            />

            <div className="glass-panel-subtle rounded-2xl p-7 md:p-10 border border-border/60">
              <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                About BullBearDays
              </p>
              <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
                500 Blueberries.{" "}
                <span className="text-gradient-gold">500 Trading Days.</span>{" "}
                One Clear Lesson.
              </h1>
              <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
                BullBearDays is built for traders who want clarity over noise: not one candle, not one trade,
                but the structure that emerges when you study hundreds of market movements and learn what typically
                happens next.
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-muted/15 p-4">
                  <div className="text-sm font-semibold text-foreground">Structure</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Every day is a data point inside a larger basket.
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/15 p-4">
                  <div className="text-sm font-semibold text-foreground">Interpretation</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    The edge is reading behavior, not guessing direction.
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/15 p-4">
                  <div className="text-sm font-semibold text-foreground">Risk awareness</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Probability is preparation, with clear invalidation.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            aria-label="BullBearDays intro video"
            className="glass-panel rounded-2xl p-4 md:p-6 border border-border/60 mb-10 md:mb-14"
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  Intro film
                </p>
                <h2 className="mt-2 text-lg md:text-xl font-semibold text-foreground tracking-tight">
                  The{" "}
                  <span className="text-sky-400 font-semibold">blueberry</span>{" "}
                  mindset... from single moments to structured advantage with{" "}
                  <span className="text-gradient-gold font-semibold">bullbeardays.com</span>
                </h2>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-border bg-muted/10">
              <div className="aspect-video bg-black/40">
                <video
                  ref={introVideoRef}
                  className="h-full w-full object-cover"
                  controls
                  playsInline
                  muted
                  preload="metadata"
                >
                  <source src="/bullbeardays_blueberries_intro.MP4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Tip: watch first, then scroll. The story below is the full written framework.
            </p>
          </section>

          <div className="space-y-6 md:space-y-8">
            {ABOUT_SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="glass-panel rounded-2xl p-7 md:p-10 border border-border/60"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 rounded-xl bg-muted/30 border border-border flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <h2 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
                      {section.title}
                    </h2>
                  </div>

                  <div className="space-y-3">{renderSectionBody(section.content)}</div>

                  {section.id === "edge" ? (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-border bg-muted/15 p-4">
                        <div className="text-sm font-semibold text-foreground">Index the movement</div>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                          <li>Where is price moving?</li>
                          <li>Why is it moving?</li>
                          <li>What type of movement is this?</li>
                        </ul>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/15 p-4">
                        <div className="text-sm font-semibold text-foreground">The next most probable move</div>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                          Not certainty, but a measurable expectation with a clear invalidation point.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {section.id === "risk" ? (
                    <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                      <p className="text-sm text-foreground font-semibold">Professional trading sounds like this</p>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        “Based on similar structures, data context and scenario alignment, this decision has a higher
                        probability to become profitable, and I know exactly what would invalidate it.”
                      </p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Educational scenario analysis only. Not financial advice.
                      </p>
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default About;

