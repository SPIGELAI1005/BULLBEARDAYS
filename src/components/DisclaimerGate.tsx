import logo from "@/assets/bullbeardays-logo.png";
import { Button } from "@/components/ui/button";
import CandlestickBackground from "@/components/CandlestickBackground";

interface DisclaimerGateProps {
  isOpen: boolean;
  onAgree: () => void;
  onExit: () => void;
}

function DisclaimerGate({ isOpen, onAgree, onExit }: DisclaimerGateProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/35 backdrop-blur-xl">
      <CandlestickBackground tone="black" opacity={0.5} />
      <div className="max-w-2xl w-[92%] p-8 md:p-10 text-center shadow-2xl border border-yellow-300/50 bg-yellow-200/10 backdrop-blur-2xl">
        <div className="flex flex-col items-center gap-4">
          <img
            src={logo}
            alt="bullbeardays logo"
            className="h-24 w-auto"
            loading="eager"
          />
          <div className="text-xs tracking-[0.2em] text-black/90 -mt-3">
            bullbeardays.com
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground underline decoration-yellow-300/70 underline-offset-4">
            Important Disclaimer
          </h1>
        </div>

        <p className="mt-5 text-[0.72rem] md:text-[0.81rem] text-yellow-300 leading-relaxed">
          <span className="block">
            Scenario analysis on this platform is provided solely for education and general information.
          </span>
          <span className="block">
            It does not constitute financial, investment, or trading advice, nor a recommendation to buy or sell any security. Trading and investing involve risk.
          </span>
          <span className="block">
            Please do your own research and consult a licensed financial advisor before making any investment decisions.
          </span>
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            className="w-full sm:w-auto min-w-32"
            onClick={onAgree}
          >
            Agree
          </Button>
          <Button
            className="w-full sm:w-auto min-w-32"
            variant="outline"
            onClick={onExit}
          >
            Exit
          </Button>
        </div>
      </div>
    </div>
  );
}

function DisclaimerExitScreen() {
  return (
    <div className="min-h-screen bg-white/90 text-black flex flex-col items-center justify-center px-6">
      <CandlestickBackground tone="black" opacity={0.5} />
      <img
        src={logo}
        alt="bullbeardays logo"
        className="h-32 w-auto mb-6"
        loading="eager"
      />
      <div className="text-xs tracking-[0.2em] text-black/80 -mt-4 mb-4">
        bullbeardays.com
      </div>
      <div className="text-2xl md:text-3xl font-semibold">Thank you!</div>
    </div>
  );
}

export { DisclaimerGate, DisclaimerExitScreen };
