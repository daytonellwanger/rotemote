import { createCanvas } from 'canvas';
import fs from 'fs';

const maxIterations = 256;
const width = 1000;
const height = 1000;

// View bounds in the complex plane (square 3.5x3.5 centered on the set)
const xMin = -2.5;
const xMax = 1.0;
const yMin = -1.75;
const yMax = 1.75;

function mandelbrot(cr: number, ci: number): number {
    let zr = 0;
    let zi = 0;
    for (let i = 0; i < maxIterations; i++) {
        const zr2 = zr * zr;
        const zi2 = zi * zi;
        if (zr2 + zi2 > 4) return i;
        zi = 2 * zr * zi + ci;
        zr = zr2 - zi2 + cr;
    }
    return maxIterations;
}

function iterationsToColor(n: number): [number, number, number] {
    if (n === maxIterations) return [0, 0, 0];
    const t = n / maxIterations;
    // Bernstein polynomial palette: black → blue → cyan → orange → white
    const r = Math.floor(9  * (1 - t) * t * t * t * 255);
    const g = Math.floor(15 * (1 - t) * (1 - t) * t * t * 255);
    const b = Math.floor(8.5 * (1 - t) * (1 - t) * (1 - t) * t * 255);
    return [r, g, b];
}

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

const imageData = ctx.createImageData(width, height);

for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
        const cr = xMin + (px / width) * (xMax - xMin);
        const ci = yMin + (py / height) * (yMax - yMin);
        const n = mandelbrot(cr, ci);
        const [r, g, b] = iterationsToColor(n);
        const idx = (py * width + px) * 4;
        imageData.data[idx]     = r;
        imageData.data[idx + 1] = g;
        imageData.data[idx + 2] = b;
        imageData.data[idx + 3] = 255;
    }
}

ctx.putImageData(imageData, 0, 0);

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('mandelbrot.png', buffer);
