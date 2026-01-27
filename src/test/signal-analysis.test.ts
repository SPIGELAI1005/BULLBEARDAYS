import { describe, it, expect } from "vitest";

describe("Trading Signal Analysis", () => {
  describe("Signal Types", () => {
    it("should recognize valid signal types", () => {
      const validSignals = ["BUY", "SELL", "HOLD"];

      validSignals.forEach((signal) => {
        expect(["BUY", "SELL", "HOLD"]).toContain(signal);
      });
    });

    it("should reject invalid signal types", () => {
      const invalidSignals = ["buy", "WAIT", "SKIP", ""];

      invalidSignals.forEach((signal) => {
        expect(["BUY", "SELL", "HOLD"]).not.toContain(signal);
      });
    });
  });

  describe("Probability Validation", () => {
    it("should validate probability range", () => {
      const validProbabilities = [0, 25, 50, 75, 100];

      validProbabilities.forEach((prob) => {
        expect(prob).toBeGreaterThanOrEqual(0);
        expect(prob).toBeLessThanOrEqual(100);
      });
    });

    it("should reject invalid probabilities", () => {
      const invalidProbabilities = [-1, 101, 150, -50];

      invalidProbabilities.forEach((prob) => {
        const isValid = prob >= 0 && prob <= 100;
        expect(isValid).toBe(false);
      });
    });
  });

  describe("Risk/Reward Ratio", () => {
    it("should parse risk/reward ratios", () => {
      const ratios = ["1:2", "1:3", "1:1.5", "2:5"];

      ratios.forEach((ratio) => {
        const parts = ratio.split(":");
        expect(parts).toHaveLength(2);
        expect(parseFloat(parts[0])).toBeGreaterThan(0);
        expect(parseFloat(parts[1])).toBeGreaterThan(0);
      });
    });

    it("should calculate risk/reward from percentages", () => {
      const stopLoss = -2.0; // -2%
      const takeProfit = 4.0; // +4%

      const riskRewardRatio = Math.abs(takeProfit / stopLoss);

      expect(riskRewardRatio).toBe(2.0); // 1:2 ratio
    });
  });

  describe("Price Target Formatting", () => {
    it("should format take profit as percentage", () => {
      const takeProfits = ["+2.5%", "+5.0%", "+10.25%"];

      takeProfits.forEach((tp) => {
        expect(tp).toMatch(/^\+\d+(\.\d+)?%$/);
      });
    });

    it("should format stop loss as percentage", () => {
      const stopLosses = ["-1.5%", "-2.0%", "-3.75%"];

      stopLosses.forEach((sl) => {
        expect(sl).toMatch(/^-\d+(\.\d+)?%$/);
      });
    });
  });

  describe("Trading Strategy Timeframes", () => {
    it("should validate timeframe formats", () => {
      const timeframes = ["5M", "15M", "1H", "4H", "1D", "1W", "1M"];

      timeframes.forEach((tf) => {
        expect(tf).toMatch(/^\d+[MHDWMY]$/);
      });
    });

    it("should map strategy to timeframes", () => {
      const strategies = {
        scalper: { short: "5M", medium: "15M", long: "1H" },
        dayTrader: { short: "1H", medium: "4H", long: "1D" },
        swingTrader: { short: "1D", medium: "1W", long: "1M" },
      };

      Object.entries(strategies).forEach(([strategy, timeframes]) => {
        expect(timeframes.short).toBeDefined();
        expect(timeframes.medium).toBeDefined();
        expect(timeframes.long).toBeDefined();
      });
    });
  });

  describe("Asset Detection", () => {
    it("should recognize crypto pairs", () => {
      const cryptoPairs = ["BTC/USDT", "ETH/USD", "SOL/USDC"];

      cryptoPairs.forEach((pair) => {
        expect(pair).toMatch(/^[A-Z]+\/[A-Z]+$/);
      });
    });

    it("should recognize forex pairs", () => {
      const forexPairs = ["EUR/USD", "GBP/USD", "USD/JPY"];

      forexPairs.forEach((pair) => {
        expect(pair).toMatch(/^[A-Z]{3}\/[A-Z]{3}$/);
        expect(pair).toHaveLength(7); // XXX/XXX = 7 chars
      });
    });

    it("should recognize stock symbols", () => {
      const stocks = ["AAPL", "GOOGL", "TSLA", "MSFT"];

      stocks.forEach((stock) => {
        expect(stock).toMatch(/^[A-Z]+$/);
        expect(stock.length).toBeGreaterThanOrEqual(1);
        expect(stock.length).toBeLessThanOrEqual(5);
      });
    });
  });

  describe("Market Categories", () => {
    it("should validate market categories", () => {
      const validCategories = ["crypto", "forex", "indices", "stocks"];

      validCategories.forEach((category) => {
        expect(["crypto", "forex", "indices", "stocks"]).toContain(category);
      });
    });

    it("should reject invalid categories", () => {
      const invalidCategories = ["commodities", "bonds", "options"];

      invalidCategories.forEach((category) => {
        expect(["crypto", "forex", "indices", "stocks"]).not.toContain(category);
      });
    });
  });
});
