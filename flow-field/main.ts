import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import fs from 'fs';

type RGB = { r: number; g: number; b: number };

function interpolateNumber(start: number, end: number, p: number) {
    return start + (end - start) * p;
}

function interpolateColor(start: RGB, end: RGB, p: number): RGB {
    return {
        r: interpolateNumber(start.r, end.r, p),
        g: interpolateNumber(start.g, end.g, p),
        b: interpolateNumber(start.b, end.b, p),
    };
}

// Classic (Ken Perlin) gradient noise, hand-rolled so the field has no
// external dependency beyond canvas.
const PERMUTATION_SIZE = 256;
function buildPermutationTable(): number[] {
    const table = Array.from({ length: PERMUTATION_SIZE }, (_, i) => i);
    for (let i = table.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [table[i], table[j]] = [table[j], table[i]];
    }
    return [...table, ...table]; // duplicated so lookups never overflow
}

const permutation = buildPermutationTable();

function fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function gradient(hash: number, x: number, y: number): number {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function noise2D(x: number, y: number): number {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = fade(xf);
    const v = fade(yf);

    const aa = permutation[permutation[xi] + yi];
    const ab = permutation[permutation[xi] + yi + 1];
    const ba = permutation[permutation[xi + 1] + yi];
    const bb = permutation[permutation[xi + 1] + yi + 1];

    const top = interpolateNumber(gradient(aa, xf, yf), gradient(ba, xf - 1, yf), u);
    const bottom = interpolateNumber(gradient(ab, xf, yf - 1), gradient(bb, xf - 1, yf - 1), u);

    return interpolateNumber(top, bottom, v); // roughly in [-1, 1]
}

const NOISE_SCALE = 0.0025; // smaller = broader, smoother swirls
const ANGLE_SCALE = Math.PI * 3; // how much of the angle circle the noise range covers

function fieldAngle(x: number, y: number): number {
    return noise2D(x * NOISE_SCALE, y * NOISE_SCALE) * ANGLE_SCALE;
}

const stops: { p: number; color: RGB }[] = [
    { p: 0.0, color: { r: 64, g: 224, b: 208 } },
    { p: 0.4, color: { r: 90, g: 156, b: 236 } },
    { p: 0.7, color: { r: 200, g: 110, b: 220 } },
    { p: 1.0, color: { r: 255, g: 130, b: 120 } },
];

function getColor(p: number): RGB {
    p = Math.min(1, Math.max(0, p));
    for (let i = 0; i < stops.length - 1; i++) {
        const start = stops[i];
        const end = stops[i + 1];
        if (p >= start.p && p <= end.p) {
            const localP = (p - start.p) / (end.p - start.p);
            return interpolateColor(start.color, end.color, localP);
        }
    }
    return stops[stops.length - 1].color;
}

const STEP_LENGTH = 2.2;
const STEPS_PER_PARTICLE = 260;
const NUM_PARTICLES = 4000;

function drawParticle(ctx: CanvasRenderingContext2D, width: number, height: number, x0: number, y0: number) {
    const color = getColor(y0 / height);
    ctx.strokeStyle = `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, 0.09)`;
    ctx.lineWidth = 1.1;

    let x = x0;
    let y = y0;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i < STEPS_PER_PARTICLE; i++) {
        const angle = fieldAngle(x, y);
        x += Math.cos(angle) * STEP_LENGTH;
        y += Math.sin(angle) * STEP_LENGTH;
        if (x < 0 || x > width || y < 0 || y > height) {
            break;
        }
        ctx.lineTo(x, y);
    }
    ctx.stroke();
}

const width = 1000;
const height = 1000;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#05070d';
ctx.fillRect(0, 0, width, height);

for (let i = 0; i < NUM_PARTICLES; i++) {
    const x0 = Math.random() * width;
    const y0 = Math.random() * height;
    drawParticle(ctx, width, height, x0, y0);
}

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('flow-field.png', buffer);
