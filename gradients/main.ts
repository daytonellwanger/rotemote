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
    { p: 0.0, color: { r: 15, g: 25, b: 60 } },
    { p: 0.25, color: { r: 40, g: 70, b: 140 } },
    { p: 0.45, color: { r: 90, g: 160, b: 200 } },
    { p: 0.6, color: { r: 255, g: 220, b: 150 } },
    { p: 0.75, color: { r: 255, g: 140, b: 60 } },
    { p: 0.9, color: { r: 220, g: 70, b: 40 } },
    { p: 1.0, color: { r: 120, g: 30, b: 60 } },
];

function getColor(p: number): RGB {
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

const startColor: RGB = { r: 15, g: 25, b: 60 };
const endColor: RGB = { r: 90, g: 160, b: 200 };

for (let y = 0; y < height; y++) {
    const color = getColor(y / height);
    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    ctx.fillRect(0, y, width, 1);
}

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('gradient.png', buffer);
