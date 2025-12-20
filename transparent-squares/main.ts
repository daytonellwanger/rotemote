import { createCanvas } from 'canvas';
import fs from 'fs';
import random from 'random';

const randomR = random.uniform(0, 255);
const randomG = random.normal(0, 255);
const randomB = random.normal(0, 255);
function getRandomColor() {
    const r = Math.min(255, Math.max(0, Math.floor(randomR())));
    const g = Math.min(255, Math.max(0, Math.floor(randomG())));
    const b = Math.min(255, Math.max(0, Math.floor(randomB())));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}44`;
}

const height = 800;
const width = 450;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, width, height);

const squareOffset = 10;
const squareWidth = 100;
const squareHeight = 100;
const stackHeight = 5;

let xStart = -squareWidth;
let yStart = -squareHeight;
let x = xStart;
let y = yStart;
let color = getRandomColor();
let idx = 0;
while (true) {

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
        color = getRandomColor();
    }
}

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('squares.png', buffer);
