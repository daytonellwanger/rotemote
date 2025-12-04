import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import fs from 'fs';

const TRUNK_WIDTH_RATIO = 0.2;
const BRANCH_RATIO = 0.7;
const BRANCH_ANGLE = Math.PI / 6;
const SMALLEST_TREE = 3;

function drawTree(ctx: CanvasRenderingContext2D, size: number): void {
    if (size < SMALLEST_TREE) {
        return;
    }

    const trunkWidth = size * TRUNK_WIDTH_RATIO;
    ctx.fillStyle = 'black';
    ctx.fillRect(0 - trunkWidth / 2, 0, trunkWidth, size);

    const branchSize = size * BRANCH_RATIO;

    ctx.translate(0, size);

    ctx.save();
    ctx.rotate(-BRANCH_ANGLE);
    drawTree(ctx, branchSize);
    ctx.restore();

    ctx.save();
    ctx.rotate(BRANCH_ANGLE);
    drawTree(ctx, branchSize);
    ctx.restore();
}

const width = 500;
const height = 400;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, width, height);

ctx.translate(width / 2, height);
ctx.rotate(Math.PI);

drawTree(ctx, 100);

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('tree.png', buffer);
