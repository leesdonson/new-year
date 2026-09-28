export interface FireworksOptions {
  autoLaunchInterval?: number;
  particlesPerBurst?: number;
  trailFade?: number;
  auto?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
  lightness: number;
  alpha: number;
  decay: number;
  size: number;
  gravity: number;
  twinkle: boolean;
  speed: number;
}

export interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
  targetY: number;
}

export interface Star {
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
  opacity: number;
}
