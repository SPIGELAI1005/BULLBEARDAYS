import { useState, useRef, useEffect } from "react";
import { DollarSign, Euro, PoundSterling } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

const CurrencyToggle = () => {
  const { currency, setCurrency } = useCurrency();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on click outside or Escape key
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowMenu(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showMenu]);

  const currencyOptions = [
    { value: "USD" as const, icon: DollarSign, label: "US Dollar", symbol: "$" },
    { value: "EUR" as const, icon: Euro, label: "Euro", symbol: "€" },
    { value: "GBP" as const, icon: PoundSterling, label: "British Pound", symbol: "£" },
  ];

  const currentOption = currencyOptions.find(c => c.value === currency) || currencyOptions[0];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
        aria-label="Currency settings"
        aria-expanded={showMenu}
        aria-haspopup="true"
      >
        <CurrentIcon className="w-5 h-5 text-muted-foreground" />
      </button>

      {showMenu && (
        <div 
          ref={menuRef}
          className="absolute right-0 top-12 z-[110] w-48 rounded-xl bg-card border border-border shadow-xl py-2 glass-panel"
        >
          <div className="px-4 py-2 border-b border-border">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Currency
            </div>
          </div>
          <div className="py-1">
            {currencyOptions.map(({ value, icon: Icon, label, symbol }) => (
              <button
                key={value}
                onClick={() => {
                  setCurrency(value);
                  setShowMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 transition-colors ${
                  currency === value
                    ? "bg-primary/20 text-foreground"
                    : "hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm flex-1 text-left">{label}</span>
                <span className={`text-sm font-medium ${currency === value ? "text-primary" : ""}`}>
                  {symbol}
                </span>
                {currency === value && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyToggle;
