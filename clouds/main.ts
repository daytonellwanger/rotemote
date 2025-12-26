import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import random from 'random';

const NUM_RECTANGLES_IN_CLOUD = 50;
function drawCloud(x: number, y: number, size: number) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    const randomX = random.normal(x, size / 2);
    const randomY = random.normal(y, size / 4);
    const randomSize = random.normal(size, size / 2);

    for (let i = 0; i < NUM_RECTANGLES_IN_CLOUD; i++) {
        ctx.fillRect(
            randomX(),
            randomY(),
            randomSize(),
            randomSize() / 4
        );
    }
}

const NUM_CLOUDS = 5;
function drawClouds() {
    for (let i = 0; i < NUM_CLOUDS; i++) {
        const x = random.int(0, width);
        const y = random.int(0, Math.floor(height / 3));
        const size = random.int(40, 150);
        drawCloud(x, y, size);
    }
}

const height = 800;
const width = 450;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

loadImage('sky.png').then((image) => {
    ctx.drawImage(image, 0, 0, width, height);

    drawClouds();

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('clouds.png', buffer);
});
