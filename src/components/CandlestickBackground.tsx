import { useEffect, useRef } from "react";

interface Candle {
  x: number;
  open: number;
  high: number;
  low: number;
  close: number;
  velocity: number;
}

const CandlestickBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const candlesRef = useRef<Candle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize candles
    const candleWidth = 12;
    const candleSpacing = 20;
    const numCandles = Math.ceil(canvas.width / (candleWidth + candleSpacing)) + 5;

    const generateCandle = (x: number): Candle => {
      const basePrice = 50 + Math.random() * 30;
      const range = 5 + Math.random() * 15;
      const open = basePrice + (Math.random() - 0.5) * range;
      const close = basePrice + (Math.random() - 0.5) * range;
      const high = Math.max(open, close) + Math.random() * range * 0.5;
      const low = Math.min(open, close) - Math.random() * range * 0.5;

      return {
        x,
        open,
        high,
        low,
        close,
        velocity: 0.3 + Math.random() * 0.3,
      };
    };

    candlesRef.current = Array.from({ length: numCandles }, (_, i) =>
      generateCandle(i * (candleWidth + candleSpacing))
    );

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get computed styles for theming
      const styles = getComputedStyle(document.documentElement);
      const bullishHsl = styles.getPropertyValue("--bullish").trim();
      const bearishHsl = styles.getPropertyValue("--bearish").trim();

      // More vibrant green/red colors for candlesticks
      const bullishColor = `hsla(${bullishHsl}, 0.4)`;
      const bearishColor = `hsla(${bearishHsl}, 0.4)`;
      const wickBullish = `hsla(${bullishHsl}, 0.3)`;
      const wickBearish = `hsla(${bearishHsl}, 0.3)`;
      const glowBullish = `hsla(${bullishHsl}, 0.6)`;
      const glowBearish = `hsla(${bearishHsl}, 0.6)`;

      const candles = candlesRef.current;

      candles.forEach((candle) => {
        // Move candle left
        candle.x -= candle.velocity;

        // Reset when off screen
        if (candle.x < -candleWidth) {
          candle.x = canvas.width + candleWidth;
          const newCandle = generateCandle(candle.x);
          candle.open = newCandle.open;
          candle.high = newCandle.high;
          candle.low = newCandle.low;
          candle.close = newCandle.close;
          candle.velocity = newCandle.velocity;
        }

        const isBullish = candle.close >= candle.open;
        const bodyColor = isBullish ? bullishColor : bearishColor;
        const wickColor = isBullish ? wickBullish : wickBearish;
        const glowColor = isBullish ? glowBullish : glowBearish;

        // Scale to canvas height
        const scale = canvas.height / 100;
        const highY = canvas.height - candle.high * scale;
        const lowY = canvas.height - candle.low * scale;
        const openY = canvas.height - candle.open * scale;
        const closeY = canvas.height - candle.close * scale;

        // Set glow effect
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 12;

        // Draw wick with glow
        ctx.beginPath();
        ctx.strokeStyle = wickColor;
        ctx.lineWidth = 1.5;
        ctx.moveTo(candle.x + candleWidth / 2, highY);
        ctx.lineTo(candle.x + candleWidth / 2, lowY);
        ctx.stroke();

        // Draw body with glow
        ctx.fillStyle = bodyColor;
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.abs(closeY - openY) || 2;
        ctx.fillRect(candle.x, bodyTop, candleWidth, bodyHeight);

        // Reset shadow for next iteration
        ctx.shadowBlur = 0;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default CandlestickBackground;
