import { createCanvas } from 'canvas';
import fs from 'fs';

const height = 800;
const width = 450;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, width, height);

const colors = ['#FF443344', '#44663344', '#44448844'];
const squareOffset = 10;
const squareWidth = 100;
const squareHeight = 100;
const stackHeight = 5;

let xStart = -squareWidth;
let yStart = -squareHeight;
let x = xStart;
let y = yStart;

let idx = 0;
while (true) {
    const color = colors[Math.floor(idx / stackHeight) % colors.length];

    ctx.fillStyle = color;
    ctx.fillRect(x, y, squareWidth, squareHeight);

    idx++;

    if (y > height) {
        break;
    }

    if (x + squareWidth > width && idx % stackHeight === 0) {
        x = xStart;
        yStart += squareHeight + squareOffset * (stackHeight - 3);
    } else {
        x += squareOffset;
        y += squareOffset;
    }

    if (idx % stackHeight === 0) {
        y = yStart;
    }
}

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('squares.png', buffer);
