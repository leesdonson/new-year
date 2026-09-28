import {
  HUES,
  MAX_PARTICLES,
  PARTICLE_FRICTION,
  pick,
  rand,
  ROCKET_GRAVITY,
} from "../lib";
import type {
  FireworksOptions,
  Particle,
  Rocket,
} from "../types/fireworks.types";
import { useRef, useCallback, useEffect, type RefObject } from "react";

export function useFireworks(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  options: FireworksOptions = {},
) {
  const {
    autoLaunchInterval = 700,
    particlesPerBurst = 110,
    trailFade = 0.18,
    auto = true,
  } = options;

  const launchRef = useRef<(x?: number, y?: number) => void>(() => {});
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduceMotion = window.matchMedia(
      "(prefers-reduce-motion: reduce)",
    ).matches;

    const autoShow = auto && !prefersReduceMotion;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;

    const particles: Particle[] = [];
    const rockets: Rocket[] = [];

    let raf = 0;
    let last = performance.now();
    let nextLaunchAt = last + 350;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;

      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const spawnRocket = (targetX?: number, targetY?: number) => {
      if (width === 0 || height === 0) return;
      const startX = targetX ?? rand(width * 0.12, width * 0.88);
      const startY = height + 10;

      const ty = Math.min(
        Math.max(targetY ?? rand(height * 0.08, height * 0.45), 48),
        height - 40,
      );
      const rise = Math.max(startY - ty, 20);

      rockets.push({
        x: startX,
        y: startY,
        vx: targetX === undefined ? rand(-0.6, 0.6) : 0,
        vy: -Math.sqrt(2 * ROCKET_GRAVITY * rise),
        hue: pick(HUES) + rand(-8, 8),
        targetY: ty,
      });
    };

    const explode = (x: number, y: number, hue: number) => {
      if (particles.length > MAX_PARTICLES) return;
      const count = Math.round(particlesPerBurst + rand(0.75, 1.25));
      const twoTone = Math.random() < 0.4;
      const hue2 = (hue + rand(90, 200)) % 360;
      const maxSpeed = rand(5.5, 9.5);

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed =
          Math.random() < 0.75
            ? maxSpeed * rand(0.72, 1)
            : maxSpeed * rand(0.12, 0.6);

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          hue: twoTone && i % 3 === 0 ? hue2 : hue + rand(-12, 12),
          lightness: rand(56, 76),
          alpha: 1,
          decay: rand(0.006, 0.014),
          size: rand(1.1, 2.4),
          gravity: 0.045,
          twinkle: Math.random() < 0.22,
          speed: Math.random() * Math.PI * 2,
        });
      }
    };
    launchRef.current = (x, y) => spawnRocket(x, y);
    //   ------------------
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);

      const dt = Math.min(now - last, 48);
      last = now;
      const k = dt / 16.6667;

      if (width === 0 || height === 0) return;
      const fade = 1 - Math.pow(1 - trailFade, k);
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0,0,0,${fade})`;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      //   ---------- schedule the show
      if (autoShow && now >= nextLaunchAt) {
        spawnRocket();
        nextLaunchAt = now + autoLaunchInterval * rand(0.55, 1.6);
      }

      //   ----- rocket
      const rocketDrag = Math.pow(0.99, k);

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx * k;
        r.y += r.vy * k;
        r.vy += ROCKET_GRAVITY * k;
        r.vx *= rocketDrag;

        ctx.strokeStyle = `hsla(${r.hue},100%,74%,0.95)`;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - r.vx * 2.6, r.y - r.vy * 2.6);
        ctx.stroke();

        if (r.vy >= 0) {
          explode(r.x, r.y, r.hue);
          rockets.splice(i, 1);
        }
      }
      //   ------- spark
      const drag = Math.pow(PARTICLE_FRICTION, k);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= drag;
        p.vy *= drag;
        p.vy += p.gravity * k;
        p.x += p.vx * k;
        p.y += p.vy * k;
        p.alpha -= p.decay * k;

        if (p.alpha <= 0.02 || p.y > height + 90) {
          particles.splice(i, 1);
          continue;
        }

        const a = p.twinkle
          ? p.alpha * (0.45 + 0.55 * Math.abs(Math.sin(now * 0.012 + p.speed)))
          : p.alpha;

        ctx.strokeStyle = `hsla(${p.hue},100%,${p.lightness},${a})`;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 1.5, p.y - p.vy * 1.5);
        ctx.stroke();
      }
    };
    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      last = performance.now();
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      particles.length = 0;
      rockets.length = 0;
      launchRef.current = () => {};
    };
  }, [canvasRef, autoLaunchInterval, particlesPerBurst, trailFade, auto]);

  const launch = useCallback((x?: number, y?: number) => {
    launchRef.current(x, y);
  }, []);
  return { launch };
}
