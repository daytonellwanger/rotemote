import { createCanvas } from 'canvas';
import fs from 'fs';

class Pixel {
    r: number;
    g: number;
    b: number;

    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    toString(): string {
        return `rgb(${Math.floor(this.r)}, ${Math.floor(this.g)}, ${Math.floor(this.b)})`;
    }
}

function draw(board: string[][], cellWidth: number, outputPath: string): void {
    const height = board.length * cellWidth;
    const width = board[0].length * cellWidth;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[0].length; x++) {
            ctx.fillStyle = board[y][x];
            ctx.fillRect(x * cellWidth, y * cellWidth, cellWidth, cellWidth);
        }
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
}

function getRandomPixel(): Pixel {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return new Pixel(r, g, b);
}

const MAX_DIFF = 20;
function generatePixelFromBase(basePixel: Pixel, damping = 0): Pixel {
    const r = Math.min(255, Math.max(0, basePixel.r + (Math.random() - 0.5 - damping) * MAX_DIFF));
    const g = Math.min(255, Math.max(0, basePixel.g + (Math.random() - 0.5 - damping) * MAX_DIFF));
    const b = Math.min(255, Math.max(0, basePixel.b + (Math.random() - 0.5 - damping) * MAX_DIFF));
    return new Pixel(r, g, b);
}

const PARENT_DISTANCE = 2;
function getParents(prevRow: Pixel[], childIdx: number, parentDistance: number): Pixel[] {
    const parents: Pixel[] = [];

    for (let offset = -parentDistance; offset <= parentDistance; offset++) {
        const parentIdx = childIdx + offset;
        if (parentIdx >= 0 && parentIdx < prevRow.length) {
            parents.push(prevRow[parentIdx]);
        }
    }

    return parents;
}

function getAveragePixel(pixels: Pixel[]): Pixel {
    let totalR = 0;
    let totalG = 0;
    let totalB = 0;

    for (const pixel of pixels) {
        totalR += pixel.r;
        totalG += pixel.g;
        totalB += pixel.b;
    }

    const avgR = totalR / pixels.length;
    const avgG = totalG / pixels.length;
    const avgB = totalB / pixels.length;

    return new Pixel(avgR, avgG, avgB);
}

const FIRST_ROW_DAMPING = 0.03;
function getFirstRow(columns: number): Pixel[] {
    const row: Pixel[] = [];

    row.push(getRandomPixel());

    for (let i = 1; i < columns; i++) {
        const parents = getParents(row, i - 1, PARENT_DISTANCE * 2);
        const avgPixel = getAveragePixel(parents);
        row.push(generatePixelFromBase(avgPixel, FIRST_ROW_DAMPING));
    }

    return row;
}

const DAMPING = 0.015;
function generateRow(prevRow: Pixel[]): Pixel[] {
    const row: Pixel[] = [];

    for (let i = 0; i < prevRow.length; i++) {
        const parents = getParents(prevRow, i, PARENT_DISTANCE);
        const avgPixel = getAveragePixel(parents);
        row.push(generatePixelFromBase(avgPixel, DAMPING));
    }

    return row;
}

function getBoard(rows: number, columns: number): Pixel[][] {
    const board = [];

    board.push(getFirstRow(columns));

    for (let r = 1; r < rows; r++) {
        const newRow = generateRow(board[r - 1]);
        board.push(newRow);
    }

    return board;
}

const board = getBoard(800, 800);
const stringBoard = board.map(row => row.map(pixel => pixel.toString()));
draw(stringBoard, 1, 'board.png');