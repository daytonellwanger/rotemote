import { createCanvas } from 'canvas';
import fs from 'fs';
import random from 'random';

type Position = {
    x: number;
    y: number;
}

const TIME_STEP = 0.1;
const ACCELERATION = 10;
function fireProjectile(initialVelocity: number, initialAngle: number): Position[] {
    const positions: Position[] = [];
    const xVelocity = initialVelocity * Math.cos(initialAngle);
    let yVelocity = initialVelocity * Math.sin(initialAngle);

    let x = 0;
    let y = 0;
    while (true) {
        if (y < 0) break; // Stop if projectile hits the ground

        positions.push({ x, y });

        x += xVelocity * TIME_STEP;
        y += yVelocity * TIME_STEP;
        yVelocity -= ACCELERATION * TIME_STEP;
    }

    return positions;
}

let imageNum = 0;
function drawTrajectory(positions: Position[]) {
    ctx.strokeStyle = '#555555AA';
    ctx.lineWidth = 2;
    ctx.beginPath();
    positions.forEach((pos, index) => {
        const canvasX = pos.x;
        const canvasY = canvasHeight - pos.y; // Invert y-axis for canvas
        if (index === 0) {
            ctx.moveTo(canvasX, canvasY);
        } else {
            ctx.lineTo(canvasX, canvasY);
        }
        ctx.stroke();
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(`./images/i_${imageNum++}.png`, buffer);
    });
}

const canvasWidth = 800;
const canvasHeight = 600;
const canvas = createCanvas(canvasWidth, canvasHeight);
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvasWidth, canvasHeight);

const VELOCITY = random.normal(70, 15);
const ANGLE = random.normal(Math.PI / 4, .3);
for (let i = 0; i < 10; i++) {
    const velocity = VELOCITY();
    const angle = ANGLE();
    drawTrajectory(fireProjectile(velocity, angle));
}
