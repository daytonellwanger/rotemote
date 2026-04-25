import { createCanvas } from 'canvas';
import fs from 'fs';

type Point = { x: number; y: number };

function lerp(a: Point, b: Point, t: number): Point {
    return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
}

function equilateralVertices(cx: number, cy: number, r: number): [Point, Point, Point] {
    return [
        { x: cx,                          y: cy - r       },
        { x: cx + r * Math.sqrt(3) / 2,   y: cy + r / 2   },
        { x: cx - r * Math.sqrt(3) / 2,   y: cy + r / 2   },
    ];
}

function kochApex(start: Point, end: Point): Point {
    const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
    const scale = Math.sqrt(3) / 2;
    return { x: mid.x + scale * (end.y - start.y), y: mid.y - scale * (end.x - start.x) };
}

function kochCurve(start: Point, end: Point, remainingIterations: number): void {
    if (remainingIterations === 0) {
        ctx.lineTo(end.x, end.y);
        return;
    }

    const p = lerp(start, end, 1 / 3);
    const q = lerp(start, end, 2 / 3);
    const apex = kochApex(p, q);

    kochCurve(start, p, remainingIterations - 1);
    kochCurve(p, apex, remainingIterations - 1);
    kochCurve(apex, q, remainingIterations - 1);
    kochCurve(q, end, remainingIterations - 1);
}

const iterations = 10;
const width = 1000;
const height = 1000;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, width, height);

const r = Math.min(width, height) * 0.38;
const cx = width / 2;
const cy = height / 2;

const [p1, p2, p3] = equilateralVertices(cx, cy, r);
ctx.beginPath();
ctx.moveTo(p1.x, p1.y);
kochCurve(p1, p2, iterations);
kochCurve(p2, p3, iterations);
kochCurve(p3, p1, iterations);
ctx.closePath();

ctx.strokeStyle = 'black';
ctx.lineWidth = 1;
ctx.stroke();

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(`snowflake.png`, buffer);
