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

function randomTile() {
    const randomX = random.normal(width / 2, width / 2);
    const randomY = random.normal(height / 2, height / 2);
    const randomSize = random.normal(50, 20);
    for (let i = 0; i < 7500; i++) {
        const randX = randomX();
        const randY = randomY();
        const randWidth = randomSize();
        const randHeight = randomSize();
        ctx.fillStyle = getRandomColor();
        ctx.fillRect(randX, randY, randWidth, randHeight);
    }
}

const xStart = -100;
const yStart = -100;
function patternedTile() {
    let x = xStart;
    let y = yStart;
    const squareSize = 50;
    const randomStep = random.normal(squareSize / 5, squareSize / 6);
    while (y < height) {
        while (x < width) {
            ctx.fillStyle = getRandomColor();
            ctx.fillRect(x, y, squareSize, squareSize);
            x += randomStep();
        }
        x = xStart;
        y += randomStep();
    }
}

const height = 800;
const width = 450;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, width, height);

// patternedTile();
randomTile();

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('squares.png', buffer);
