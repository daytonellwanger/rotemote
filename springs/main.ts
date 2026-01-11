import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import fs from 'fs';

const TIME_STEP = .02;
const MASS = 1;
const INITIAL_POSITION = 0;
const INITIAL_VELOCITY = 100;

class Spring {
    constructor(
        private k: number,
        private mass = MASS,
        private position = INITIAL_POSITION,
        private velocity = INITIAL_VELOCITY
    ) { }

    public step(timeStep: number) {
        const force = -this.k * this.position;
        const acceleration = force / this.mass;
        this.velocity += acceleration * timeStep;
        this.position += this.velocity * timeStep;
    }

    public draw(ctx: CanvasRenderingContext2D, translationX: number, translationY: number) {
        ctx.beginPath();
        ctx.arc(translationX + this.position, translationY, 10, 0, Math.PI * 2);
        ctx.fill();
    }
}

const springs: Spring[] = [];
for (let i = 0; i < 50; i++) {
    const k = .1 + i * .02;
    springs.push(new Spring(k));
}

const height = 1000;
const width = 800;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, width, height);

let imageNum = 0;
const X_TRANSLATION = width / 2;
function drawSprings() {
    let blue = 120;
    for (let s = 0; s < springs.length; s++) {
        ctx.fillStyle = `rgba(27, 72, ${blue}, 0.2)`;
        springs[s].draw(ctx, X_TRANSLATION, height / springs.length * s + 10);
        blue -= 1;
    }
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`./images/spring_${imageNum}.png`, buffer);
    imageNum++;
}

function stepSprings() {
    for (let s of springs) {
        s.step(TIME_STEP);
    }
}

for (let i = 0; i < 1200; i++) {
    if (i % 5 === 0) {
        drawSprings();
        if (imageNum % 12 === 0) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
        }
    }
    stepSprings();
}
