import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CandlestickBackground from "@/components/CandlestickBackground";

function Card(props: { title: string; body: string; bullets: string[] }) {
  return (
    <div className="glass-panel p-6">
      <div className="text-lg font-semibold text-foreground">{props.title}</div>
      <div className="text-sm text-muted-foreground mt-2 leading-relaxed">{props.body}</div>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {props.bullets.map((b) => (
          <li key={b}>• {b}</li>
        ))}
      </ul>
    </div>
  );
}

export default function UseCases() {
  useEffect(() => {
    document.title = "Use cases | BullBearDays";
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <CandlestickBackground />
      <div className="relative z-10">
        <Header />
        <main className="max-w-7xl mx-auto px-4 pt-28 pb-16 md:px-6">
          <div className="glass-panel-subtle p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Use cases</h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
              BullBearDays is an educational scenario analysis tool. It helps you reason about charts
              with structured bull/bear narratives, key levels, invalidation, and risk notes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <Card
              title="Trading journal & review"
              body="Capture your read at the moment you took it — then compare later with what actually happened."
              bullets={[
                "Store scenarios with instrument/timeframe/strategy",
                "Mark what played out (bull vs bear vs unclear)",
                "Spot recurring mistakes and improve discipline",
              ]}
            />
            <Card
              title="Education & skill building"
              body="Use the scenarios to practice technical analysis language and structured thinking."
              bullets={[
                "Learn how invalidation levels work",
                "Improve risk framing (not just targets)",
                "Develop consistency across timeframes",
              ]}
            />
            <Card
              title="Coach / team review"
              body="Share a scenario card with your coach or team for critique — without framing it as advice."
              bullets={[
                "Two-sided scenario discussion",
                "Better feedback on your assumptions",
                "Portable export/share artifacts",
              ]}
            />
          </div>

          <div className="mt-8 glass-panel p-6">
            <div className="text-sm font-semibold text-foreground">Important</div>
            <div className="text-sm text-muted-foreground mt-2">
              This is educational scenario analysis only. It is not financial advice and does not
              instruct you to buy or sell.
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
