const ROCKET_GRAVITY = 0.26;
const PARTICLE_FRICTION = 0.965;
const HUES = [0, 20, 42, 58, 150, 188, 212, 268, 300, 328];
const MAX_PARTICLES = 2800;

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = <T>(arr: T[]) => arr[(Math.random() * arr.length) | 0];

export { ROCKET_GRAVITY, PARTICLE_FRICTION, HUES, MAX_PARTICLES, rand, pick };
