import { createCanvas } from 'canvas';
import fs from 'fs';

function draw(board: string[][], cellWidth: number, outputPath: string): void {
    const height = board.length * cellWidth;
    const width = board[0].length * cellWidth;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[0].length; x++) {
            ctx.fillStyle = board[y][x];
            ctx.fillRect(x * cellWidth, y * cellWidth, cellWidth, cellWidth);
        }
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
}

function getRandomColor(): string {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

function getGray(percentWhite: number): string {
    if (percentWhite > 1) percentWhite = 1;
    if (percentWhite < 0) percentWhite = 0;

    const value = Math.floor(percentWhite * 255);
    return `rgb(${value}, ${value}, ${value})`;
}

function getBoard(rows: number, columns: number): string[][] {
    const board = [];
    let percentWhite = 0;
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < columns; c++) {
            if ((c + r) % 2 === 0) {
                row.push('white');
            } else {
                row.push(getGray(percentWhite));
            }
            percentWhite += .012;
        }
        board.push(row);
    }
    return board;
}

const board = getBoard(8, 8);
draw(board, 100, 'board.png');
