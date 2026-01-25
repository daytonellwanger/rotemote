import { createCanvas } from 'canvas';
import fs from 'fs';

type RGB = { r: number; g: number; b: number };

type Stop = { p: number; color: RGB };

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

function interpolateStops(stopsA: Stop[], stopsB: Stop[], t: number): Stop[] {
    return stopsA.map((stop, index) => ({
        p: stop.p,
        color: interpolateColor(stop.color, stopsB[index].color, t),
    }));
}

function getColor(stops: Stop[], p: number): RGB {
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

const stops1: Stop[] = [
    { p: 0.0, color: { r: 173, g: 216, b: 230 } },
    { p: 0.25, color: { r: 135, g: 206, b: 235 } },
    { p: 0.5, color: { r: 100, g: 149, b: 237 } },
    { p: 0.8, color: { r: 70, g: 130, b: 180 } },
    { p: 1.0, color: { r: 30, g: 144, b: 255 } },
];

const stops2: Stop[] = [
    { p: 0.0, color: { r: 50, g: 63, b: 74 } },
    { p: 0.25, color: { r: 143, g: 154, b: 153 } },
    { p: 0.5, color: { r: 213, g: 167, b: 117 } },
    { p: 0.8, color: { r: 255, g: 174, b: 56 } },
    { p: 1.0, color: { r: 233, g: 129, b: 52 } },
];

const stops3: Stop[] = [
    { p: 0.0, color: { r: 20, g: 28, b: 38 } },
    { p: 0.25, color: { r: 40, g: 50, b: 65 } },
    { p: 0.5, color: { r: 60, g: 70, b: 90 } },
    { p: 0.8, color: { r: 30, g: 35, b: 60 } },
    { p: 1.0, color: { r: 10, g: 15, b: 30 } },
];

const stops4: Stop[] = [
    { p: 0.0, color: { r: 5, g: 8, b: 18 } },
    { p: 0.25, color: { r: 10, g: 15, b: 30 } },
    { p: 0.5, color: { r: 15, g: 20, b: 40 } },
    { p: 0.8, color: { r: 10, g: 15, b: 30 } },
    { p: 1.0, color: { r: 5, g: 8, b: 18 } },
];

const height = 400;
const width = 400;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

const numFrames = 500;
const stopsList = [stops1, stops2, stops3, stops4];
const numSegments = stopsList.length - 1;
const framesPerSegment = Math.floor(numFrames / numSegments);

for (let frame = 0; frame < numFrames; frame++) {
    const segment = Math.min(Math.floor(frame / framesPerSegment), numSegments - 1);
    const localFrame = frame - segment * framesPerSegment;
    const t = localFrame / (framesPerSegment - 1);
    const interpolatedStops = interpolateStops(stopsList[segment], stopsList[segment + 1], t);

    for (let y = 0; y < height; y++) {
        const color = getColor(interpolatedStops, y / height);
        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.fillRect(0, y, width, 1);
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`./images/gradient_${frame}.png`, buffer);
}
