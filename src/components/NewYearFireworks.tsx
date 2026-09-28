import React, { useCallback, useMemo, useRef, useState } from "react";
import { useFireworks } from "../hooks/useFireworks";
import type { Star } from "../types/fireworks.types";

const now = new Date();
const YEAR = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();

export default function NewYearFireworks() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { launch } = useFireworks(canvasRef, {
    autoLaunchInterval: 720,
    particlesPerBurst: 120,
    trailFade: 0.16,
  });

  const [volleys, setvolleys] = useState(0);
  const [message, setMessage] = useState("A new Chapter Begins!");

  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: 90 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 0.6,
        delay: `${Math.random() * 4}s`,
        duration: `${2.5 + Math.random() * 3}s`,
        opacity: 0.25 + Math.random() * 0.6,
      })),
    [],
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      launch(e.clientX - rect.left, e.clientY - rect.top);
    },
    [launch],
  );

  const fireVolley = useCallback(() => {
    setvolleys((v) => v + 1);
    setMessage("Wishing you Joy & Light");
    const shots = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < shots; i++) {
      window.setTimeout(() => launch(), i * 170 + Math.random() * 120);
    }
  }, [launch]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#04030d] font-sans text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_110%,#1b1140_0%,#0b0722_45%,#04030d_100%)]" />
      <div className="pointer-events-none absolute inset-0">
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white animate-[twinkle_3s_ease-in-out_infinit]"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          />
        ))}
      </div>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 h-full w-full cursor-crosshair"
      />
      <main className="pointer-events-none relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-[0.65rem] uppercase tracking-[0.5em] text-amber-200/70 sm:text-xs">
          {message}
        </p>
        <h1>
          Happy <br /> New
        </h1>
        <div className="mt-2 text-6xl font-black tabular-nums text-amber-300 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] sm:text-8xl md:text-9xl">
          {YEAR}
        </div>
        <p className="mt-6 max-w-md text-sm text-white/60 sm:text-base">
          May every spark above carry a wish for the year ahead
        </p>
        <button
          type="button"
          onClick={fireVolley}
          className="pointer-events-auto mt-10 rounded-full border border-amber-300/40 bg-amber-400/10 px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-200 backdrop-blur-sm transition hover:scale-105 hover:border-amber-300/80 hover:bg-amber-400/20 hover:text-amber-100 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
        >
          Launch the Fireworks
        </button>
        <p>
          {volleys > 0
            ? `${volleys} volley${volleys > 1 ? "s" : ""} launched - tap the sky fore more`
            : "Tip: tap anywhere on the sky"}
        </p>
      </main>
    </div>
  );
}
