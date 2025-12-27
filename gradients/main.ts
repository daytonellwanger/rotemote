import { createCanvas } from 'canvas';
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

const stops: { p: number; color: RGB }[] = [
    { p: 0.0, color: { r: 50, g: 63, b: 74 } },
    { p: 0.25, color: { r: 143, g: 154, b: 153 } },
    { p: 0.5, color: { r: 213, g: 167, b: 117 } },
    { p: 0.8, color: { r: 255, g: 174, b: 56 } },
    { p: 1.0, color: { r: 233, g: 129, b: 52 } },
];

function getColor(p: number): RGB {
    p = Math.min(1, Math.max(0, Math.pow(p, 1.6))); // bias toward bottom
    for (let i = 0; i < stops.length - 1; i++) {
        const start = stops[i];
        const end = stops[i + 1];
        if (p >= start.p && p <= end.p) {
            const localP = (p - start.p) / (end.p - start.p);
            return interpolateColor(start.color, end.color, localP);
        }
    }
    throw new Error('p out of bounds');
}

const height = 400;
const width = 500;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

for (let y = 0; y < height; y++) {
    const color = getColor(y / height);
    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    ctx.fillRect(0, y, width, 1);
}

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('gradient.png', buffer);
