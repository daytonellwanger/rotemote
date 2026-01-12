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

    public draw(ctx: CanvasRenderingContext2D, translationX: number, translationY: number, size = 10) {
        ctx.beginPath();
        ctx.arc(translationX + this.position, translationY, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

let springs: Spring[] = [];
let numSprings = 1;
const MAX_SPRINGS = 101;
const MAX_K = .1 + (MAX_SPRINGS - 1) * .02;
function resetSprings() {
    springs = [];
    for (let i = 0; i < numSprings; i++) {
        const k = MAX_K - i * .02;
        springs.push(new Spring(k));
    }
    numSprings++;
}

resetSprings();

const height = 1000;
const width = 800;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, width, height);

let imageNum = 0;
const X_TRANSLATION = width / 2;
const SPRING_SPACING = 1;
function drawSprings() {
    ctx.fillStyle = 'white';
    ctx.fillRect(40, 80, 140, 40);
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`SPRINGS: ${numSprings - 1}`, 40, 110);

    let blue = 120;
    const smallNHeight = springs.length < 50 ? 50 - 40 * (springs.length / 50) : 1000;
    const size = Math.min((height - 20 - SPRING_SPACING * springs.length) / (2 * springs.length), smallNHeight);
    const totalSpringHeight = springs.length * (2 * size + SPRING_SPACING);
    const firstSpringY = (height - totalSpringHeight) / 2 + size;
    for (let s = 0; s < springs.length; s++) {
        ctx.fillStyle = `rgba(27, 72, ${blue}, 0.2)`;
        springs[s].draw(ctx, X_TRANSLATION, (2 * size + SPRING_SPACING) * (springs.length - 1 - s) + firstSpringY, size);
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

let numSteps = 0;

function resetAndCatchUp() {
    resetSprings();
    for (let i = 0; i < numSteps; i++) {
        stepSprings();
    }
}

const LAP_LENGTH = 12 * 18;
function doFullLap() {
    let lapLength = numSprings < 100 ? LAP_LENGTH : LAP_LENGTH * 4;
    for (let i = 0; i < lapLength; i++) {
        if (i % 5 === 0) {
            drawSprings();
        }
        stepSprings();
        numSteps++;
    }
}

doFullLap();

const STOPS = [2, 5, 10, 20, 40, 65, 100, 200];

function shouldIncreaseSprings(i: number): boolean {
    if (numSprings < 21) {
        return i % 5 === 0;
    } else if (numSprings < 41) {
        return i % 3 === 0;
    } else if (numSprings < 101) {
        return i % 2 === 0;
    } else {
        return true;
    }
}

for (let i = 0; numSprings < MAX_SPRINGS; i++) {
    if (i % 5 === 0) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        drawSprings();
    }

    stepSprings();
    numSteps++;

    if (shouldIncreaseSprings(i)) {
        resetAndCatchUp();
        if (STOPS.indexOf(numSprings - 1) >= 0) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            numSteps = 0;
            doFullLap();
        }
    }
}
