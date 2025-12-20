import { createCanvas } from 'canvas';
import fs from 'fs';
import random from 'random';

const randomR = random.normal(200, 60);
const randomG = random.normal(50, 20);
const randomB = random.normal(50, 20);
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

for (let i = 0; i < 4500; i++) {
    const randX = Math.floor(Math.random() * (width + 100)) - 100;
    const randY = Math.floor(Math.random() * (height + 100)) - 100;
    const randSize = Math.floor(Math.random() * 50) + 10;
    ctx.fillStyle = getRandomColor();
    ctx.fillRect(randX, randY, randSize, randSize);
}

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('squares.png', buffer);
