import { createCanvas } from 'canvas';
import fs from 'fs';

type RGBA = { r: number; g: number; b: number; a: number };

type Stop = {
    start: RGBA;    // color at the top of the band
    stop: RGBA;    // color at the bottom of the band
    top: number[]; // Catmull-Rom knots for the top boundary    (0 = image top)
    bottom: number[]; // Catmull-Rom knots for the bottom boundary (1 = image bottom)
};

// ── Color stops ───────────────────────────────────────────────────────────────
// n bands are generated procedurally.  Colors cycle slowly through the dark
// blue-green-teal family; each band gets a unique wave shape via golden-ratio
// phase stepping so the undulations never quite repeat.

function generateStops(n: number): Stop[] {
    const result: Stop[] = [];

    // Layer 0: deep space backdrop spanning the full image.
    result.push({
        start: { r: 2, g: 5, b: 20, a: 1 },
        stop: { r: 8, g: 15, b: 45, a: 1 },
        top: [0, 0, 0, 0, 0, 0, 0, 0],
        bottom: [1, 1, 1, 1, 1, 1, 1, 1],
    });

    for (let i = 0; i < n; i++) {
        const t = i / (n - 1); // 0 → 1 across all bands

        // Color: three incommensurate sine cycles keep nearby bands
        // similar while still varying across the full set.
        const r = Math.round(5 + 25 * (Math.sin(t * Math.PI * 4.0) * 0.5 + 0.5));
        const g = Math.round(35 + 75 * (Math.sin(t * Math.PI * 2.7 + 0.80) * 0.5 + 0.5));
        const b = Math.round(60 + 80 * (Math.sin(t * Math.PI * 3.1 + 1.60) * 0.5 + 0.5));

        // Vertical band: centred at t, half-width 12 % of image height.
        const center = t;
        const halfWidth = 0.12;
        const amp = 0.035; // subtle undulation amplitude

        // Golden-ratio phase stepping: 1.61803… is irrational, so consecutive
        // bands never share a phase and patterns don't visibly repeat.
        const phi = i * 1.61803;
        const freq1 = 1.5 + Math.sin(i * 0.27) * 0.8;
        const freq2 = 2.0 + Math.cos(i * 0.31) * 0.7;

        const topKnots: number[] = [];
        const bottomKnots: number[] = [];
        for (let k = 0; k < 8; k++) {
            const x = k / 7;
            topKnots.push(
                Math.max(0, Math.min(1,
                    (center - halfWidth) + Math.sin(x * Math.PI * freq1 + phi) * amp
                ))
            );
            bottomKnots.push(
                Math.max(0, Math.min(1,
                    (center + halfWidth) + Math.sin(x * Math.PI * freq2 + phi + Math.PI * 0.7) * amp
                ))
            );
        }

        result.push({
            start: { r, g, b, a: 0.08 },
            stop: { r: Math.min(255, r + 15), g: Math.min(255, g + 15), b: Math.min(255, b + 15), a: 0.06 },
            top: topKnots,
            bottom: bottomKnots,
        });
    }

    return result;
}

const stops = generateStops(50);

// ── Catmull-Rom spline ───────────────────────────────────────────────────────

function catmullRom(
    p0: number, p1: number, p2: number, p3: number, t: number,
): number {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * (
        2 * p1
        + (-p0 + p2) * t
        + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2
        + (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
}

/** Evaluate a Catmull-Rom spline at x ∈ [0, 1] given uniformly-spaced knots. */
function evalSpline(knots: number[], x: number): number {
    const n = knots.length;
    const scaled = x * (n - 1);
    const i = Math.min(n - 2, Math.floor(scaled));
    const t = scaled - i;
    const p0 = knots[Math.max(0, i - 1)];
    const p1 = knots[i];
    const p2 = knots[Math.min(n - 1, i + 1)];
    const p3 = knots[Math.min(n - 1, i + 2)];
    return catmullRom(p0, p1, p2, p3, t);
}

function rgba({ r, g, b, a }: RGBA): string {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function avg(knots: number[]): number {
    return knots.reduce((s, v) => s + v, 0) / knots.length;
}

// ── Render ───────────────────────────────────────────────────────────────────

const height = 1080;
const width = 1080;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Paint each stop's band as a filled path; the canvas composites them in order.
for (const s of stops) {
    ctx.beginPath();

    // Trace the top edge left → right.
    for (let x = 0; x <= width; x++) {
        const y = evalSpline(s.top, x / width) * height;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }

    // Trace the bottom edge right → left to close the band shape.
    for (let x = width; x >= 0; x--) {
        ctx.lineTo(x, evalSpline(s.bottom, x / width) * height);
    }

    ctx.closePath();

    // Vertical gradient anchored to the band's average top and bottom y.
    const grad = ctx.createLinearGradient(0, avg(s.top) * height, 0, avg(s.bottom) * height);
    grad.addColorStop(0, rgba(s.start));
    grad.addColorStop(1, rgba(s.stop));
    ctx.fillStyle = grad;
    ctx.fill();
}

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(`splines.png`, buffer);
