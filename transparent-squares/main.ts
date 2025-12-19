import { createCanvas } from 'canvas';
import fs from 'fs';

const height = 800;
const width = 450;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, width, height);

ctx.fillStyle = '#FF443366';

const squareWidth = 100;
const squareHeight = 100;
for (let i = 0; i < 5; i++) {
    const x = 5 + i * 10;
    const y = 290 + i * 10;
    ctx.fillRect(x, y, squareWidth, squareHeight);
}

ctx.fillStyle = '#44663366';

for (let i = 0; i < 5; i++) {
    const x = 155 + i * 10;
    const y = 290 + i * 10;
    ctx.fillRect(x, y, squareWidth, squareHeight);
}

ctx.fillStyle = '#44448866';

for (let i = 0; i < 5; i++) {
    const x = 305 + i * 10;
    const y = 290 + i * 10;
    ctx.fillRect(x, y, squareWidth, squareHeight);
}

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('squares.png', buffer);
