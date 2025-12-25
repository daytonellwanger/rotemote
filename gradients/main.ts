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

const height = 400;
const width = 500;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

const startColor: RGB = { r: 15, g: 25, b: 60 };
const endColor: RGB = { r: 90, g: 160, b: 200 };

for (let y = 0; y < height; y++) {
    const color = interpolateColor(startColor, endColor, y / height);
    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    ctx.fillRect(0, y, width, 1);
}

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('gradient.png', buffer);
