import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import fs from 'fs';
import random from 'random';

const TRUNK_WIDTH_RATIO = random.normal(0.15, 0.02);
const BRANCH_RATIO = random.normal(0.75, 0.05);
const BRANCH_ANGLE = random.normal(Math.PI / 8, 0.1);
const SMALLEST_TREE = 3;

const drawQueue: Array<() => void> = [];

let imageNum = 0;
let prevDepth = -1;
function drawTree(ctx: CanvasRenderingContext2D, size: number, transformations: Array<() => void>, depth: number): void {
    if (size < SMALLEST_TREE) {
        return;
    }

    const trunkWidth = size * TRUNK_WIDTH_RATIO();

    if (depth !== prevDepth) {
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(`./images/i_${imageNum++}.png`, buffer);
        prevDepth = depth;
    }

    ctx.save();
    transformations.forEach(transformation => transformation());
    ctx.fillStyle = 'black';
    ctx.fillRect(0 - trunkWidth / 2, 0, trunkWidth, size);
    ctx.restore();

    const branchSize = size * BRANCH_RATIO();

    const branchAngle1 = -BRANCH_ANGLE();
    const branchAngle2 = BRANCH_ANGLE();
    drawQueue.push(() => drawTree(ctx, branchSize, [...transformations, () => ctx.translate(0, size), () => ctx.rotate(branchAngle1)], depth + 1));
    drawQueue.push(() => drawTree(ctx, branchSize, [...transformations, () => ctx.translate(0, size), () => ctx.rotate(branchAngle2)], depth + 1));    
}

function processDrawQueue(): void {
    while (drawQueue.length > 0) {
        const drawFunction = drawQueue.shift();
        if (drawFunction) {
            drawFunction();
        }
    }
}

const width = 700;
const height = 600;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, width, height);

ctx.translate(width / 2, height);
ctx.rotate(Math.PI);
    
drawTree(ctx, 100, [], 0);
processDrawQueue();