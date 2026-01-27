import { useState, useEffect, createContext, useContext, ReactNode } from "react";

type Currency = "USD" | "EUR" | "GBP";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  symbol: string;
  format: (value: number) => string;
  convert: (value: number, fromCurrency?: Currency) => number;
  formatConverted: (value: number, fromCurrency?: Currency) => string;
  exchangeRates: Record<Currency, number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const currencyConfig: Record<Currency, { symbol: string; locale: string }> = {
  USD: { symbol: "$", locale: "en-US" },
  EUR: { symbol: "€", locale: "de-DE" },
  GBP: { symbol: "£", locale: "en-GB" },
};

// Exchange rates relative to USD (base currency)
// These are approximate rates - in production, you'd fetch real-time rates from an API
const exchangeRatesToUSD: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,  // 1 USD = 0.92 EUR
  GBP: 0.79,  // 1 USD = 0.79 GBP
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("currency");
      if (saved && (saved === "USD" || saved === "EUR" || saved === "GBP")) {
        return saved;
      }
    }
    return "USD";
  });

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const symbol = currencyConfig[currency].symbol;

  // Convert value from one currency to the selected currency
  // Default fromCurrency is USD (most prices are in USD)
  const convert = (value: number, fromCurrency: Currency = "USD"): number => {
    if (fromCurrency === currency) return value;
    
    // Convert to USD first, then to target currency
    const valueInUSD = value / exchangeRatesToUSD[fromCurrency];
    const convertedValue = valueInUSD * exchangeRatesToUSD[currency];
    
    return convertedValue;
  };

  const format = (value: number): string => {
    return new Intl.NumberFormat(currencyConfig[currency].locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Convert and format in one step
  const formatConverted = (value: number, fromCurrency: Currency = "USD"): string => {
    const converted = convert(value, fromCurrency);
    return format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      symbol, 
      format, 
      convert, 
      formatConverted,
      exchangeRates: exchangeRatesToUSD 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
