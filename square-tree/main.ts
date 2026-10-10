import { createCanvas } from 'canvas';
import fs from 'fs';

// The challenge: draw a tree using exactly 100 identical translucent gray
// squares (200x200 by default; pass a different size, e.g. `tsx main.ts 500`) on a 1000x1000 canvas. Instead of placing them by hand, we
// describe the tree we want as a "target" darkness map and use simulated
// annealing to nudge the squares around until their overlaps match it.

const CANVAS_SIZE = 1000;
const SQUARE_SIZE = Number(process.argv[2] ?? 200);
const NUM_SQUARES = 100;
const ALPHA = Number(process.argv[3] ?? 0.12);

// Optimize on a coarser grid for speed; each grid cell is SCALE x SCALE pixels,
// chosen so a square is always 50 cells across.
const SCALE = SQUARE_SIZE / 50;
const GRID = CANVAS_SIZE / SCALE;
const SQ = SQUARE_SIZE / SCALE;
// Squares may hang off the canvas (or leave it entirely if they're not useful).
const MIN_POS = -SQ;
const MAX_POS = GRID;

const ITERATIONS = 2_000_000;
const START_TEMP = 0.5;
const END_TEMP = 0.0005;

// --- The target picture -----------------------------------------------------

function inCircle(x: number, y: number, cx: number, cy: number, r: number) {
    return (x - cx) ** 2 + (y - cy) ** 2 < r ** 2;
}

// Pick a random tree: where it stands, how it leans, and how its canopy is
// shaped. Set FIXED_TREE=1 to always draw the same tree instead.
function rand(min: number, max: number) {
    return process.env.FIXED_TREE ? (min + max) / 2 : min + Math.random() * (max - min);
}

const groundY = rand(860, 960);
const trunkBaseX = rand(350, 650);
const canopyX = trunkBaseX + rand(-100, 100);
const canopyY = rand(250, 420);
const canopyR = rand(170, 270);
const trunkHalfWidth = rand(30, 70);
const trunkDarkness = rand(0.7, 0.9);
const canopyDarkness = rand(0.45, 0.65);

// The canopy is a cloud of overlapping circles around a central one.
const lobes: [number, number, number][] = [[canopyX, canopyY, canopyR]];
const numLobes = process.env.FIXED_TREE ? 5 : 3 + Math.floor(Math.random() * 5);
for (let i = 0; i < numLobes; i++) {
    const angle = process.env.FIXED_TREE ? (i / numLobes) * 2 * Math.PI : Math.random() * 2 * Math.PI;
    const dist = canopyR * rand(0.5, 0.9);
    lobes.push([canopyX + Math.cos(angle) * dist, canopyY + Math.sin(angle) * dist, canopyR * rand(0.4, 0.7)]);
}

// Returns how dark (0 = white, 1 = black) we'd like each pixel to be.
function targetDarkness(x: number, y: number): number {
    // Ground
    if (y > groundY) {
        return 0.4;
    }

    // Trunk, leaning from its base toward the canopy and flaring out at the bottom
    if (y > canopyY) {
        const t = (groundY - y) / (groundY - canopyY);
        const centerX = trunkBaseX + (canopyX - trunkBaseX) * t;
        const flare = Math.max(0, 1 - t * 4) ** 2 * trunkHalfWidth;
        if (Math.abs(x - centerX) < trunkHalfWidth + flare) {
            return trunkDarkness;
        }
    }

    // Canopy, darker near the middle
    if (lobes.some(([cx, cy, r]) => inCircle(x, y, cx, cy, r))) {
        return inCircle(x, y, canopyX, canopyY + canopyR * 0.1, canopyR * 0.85) ? canopyDarkness + 0.15 : canopyDarkness;
    }

    return 0;
}

const target = new Float64Array(GRID * GRID);
for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
        target[gy * GRID + gx] = targetDarkness((gx + 0.5) * SCALE, (gy + 0.5) * SCALE);
    }
}

// --- Optimization -----------------------------------------------------------

// Darkness produced by n stacked squares.
const darknessForCount: number[] = [];
for (let n = 0; n <= NUM_SQUARES; n++) {
    darknessForCount.push(1 - (1 - ALPHA) ** n);
}

const counts = new Int32Array(GRID * GRID);

function randomPos() {
    return MIN_POS + Math.floor(Math.random() * (MAX_POS - MIN_POS + 1));
}

const squares = Array.from({ length: NUM_SQUARES }, () => ({ x: randomPos(), y: randomPos() }));

function addSquare(sx: number, sy: number, delta: number) {
    for (let y = Math.max(0, sy); y < Math.min(GRID, sy + SQ); y++) {
        for (let x = Math.max(0, sx); x < Math.min(GRID, sx + SQ); x++) {
            counts[y * GRID + x] += delta;
        }
    }
}

// Error of every pixel inside the bounding box of both squares.
function regionError(x0: number, y0: number, x1: number, y1: number) {
    let error = 0;
    for (let y = Math.max(0, y0); y < Math.min(GRID, y1); y++) {
        for (let x = Math.max(0, x0); x < Math.min(GRID, x1); x++) {
            const i = y * GRID + x;
            error += (darknessForCount[counts[i]] - target[i]) ** 2;
        }
    }
    return error;
}

squares.forEach(s => addSquare(s.x, s.y, 1));

function clamp(v: number) {
    return Math.min(MAX_POS, Math.max(MIN_POS, v));
}

for (let iter = 0; iter < ITERATIONS; iter++) {
    const t = iter / ITERATIONS;
    const temp = START_TEMP * (END_TEMP / START_TEMP) ** t;

    const s = squares[Math.floor(Math.random() * NUM_SQUARES)];
    let nx: number, ny: number;
    if (Math.random() < 0.05) {
        // Occasionally teleport somewhere entirely new
        nx = randomPos();
        ny = randomPos();
    } else {
        // Usually a small nudge, shrinking as we cool down
        const step = Math.max(1, Math.round(SQ * (1 - t)));
        nx = clamp(s.x + Math.round((Math.random() * 2 - 1) * step));
        ny = clamp(s.y + Math.round((Math.random() * 2 - 1) * step));
    }
    if (nx === s.x && ny === s.y) {
        continue;
    }

    const bx0 = Math.min(s.x, nx), by0 = Math.min(s.y, ny);
    const bx1 = Math.max(s.x, nx) + SQ, by1 = Math.max(s.y, ny) + SQ;
    const before = regionError(bx0, by0, bx1, by1);
    addSquare(s.x, s.y, -1);
    addSquare(nx, ny, 1);
    const after = regionError(bx0, by0, bx1, by1);
    const delta = after - before;

    if (delta <= 0 || Math.random() < Math.exp(-delta / temp)) {
        s.x = nx;
        s.y = ny;
    } else {
        addSquare(nx, ny, -1);
        addSquare(s.x, s.y, 1);
    }
}

// --- Draw -------------------------------------------------------------------

const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

ctx.fillStyle = `rgba(0, 0, 0, ${ALPHA})`;
for (const s of squares) {
    ctx.fillRect(s.x * SCALE, s.y * SCALE, SQUARE_SIZE, SQUARE_SIZE);
}

const fileName = process.argv[4] ?? (SQUARE_SIZE === 200 ? 'example.png' : `example-${SQUARE_SIZE}.png`);
fs.writeFileSync(fileName, canvas.toBuffer('image/png'));

const onScreen = squares.filter(s => s.x > MIN_POS && s.x < MAX_POS && s.y > MIN_POS && s.y < MAX_POS);
console.log(`${onScreen.length} of ${NUM_SQUARES} squares are visible`);
