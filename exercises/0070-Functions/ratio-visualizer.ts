// A grid of 10x10 circles represents 100 units.
// A random number n (0–100) determines how many circles are "filled".
// Circles are counted left-to-right, top-to-bottom.

// Canvas / layout constants
const COLS = 10;
const ROWS = 10;
const CELL_SIZE = 46;  // distance between circle centers
const MARGIN = 10;
const TITLE_HEIGHT = 35;

// Colors
const COLOR_FILLED = "steelblue";
const COLOR_EMPTY = "lightgray";
const COLOR_STROKE = "white";

// The random number we want to visualize (0–100)
let randomNumber: number;

/**
 * Returns true if the circle at (row, col) should be colored.
 *
 * @param row  - zero-based row index (0 … ROWS-1)
 * @param col  - zero-based column index (0 … COLS-1)
 * @param n    - how many circles (out of 100) should be filled
 */
function isColored(row: number, col: number, n: number): boolean {
    return row * COLS + col < n;
}

/**
 * Draws a single circle centered at the current origin (0, 0).
 * Uses push/pop so fill/stroke changes don't leak out.
 *
 * @param colored - whether the circle should be highlighted
 */
function drawCircle(colored: boolean): void {
    push();
    stroke(COLOR_STROKE);
    strokeWeight(2);
    fill(colored ? COLOR_FILLED : COLOR_EMPTY);
    circle(0, 0, CELL_SIZE - 10);
    pop();
}

function setup(): void {
    createCanvas(COLS * CELL_SIZE + 2 * MARGIN, ROWS * CELL_SIZE + TITLE_HEIGHT + MARGIN);

    randomNumber = Math.floor(Math.random() * 101);

    background("white");

    // Title
    noStroke();
    fill("black");
    textSize(14);
    textAlign(CENTER);
    text(`Random number: ${randomNumber} / 100`, width / 2, 20);

    // Step the origin by CELL_SIZE on each iteration — no coordinate math needed
    translate(MARGIN + CELL_SIZE / 2, TITLE_HEIGHT + CELL_SIZE / 2);
    for (let row = 0; row < ROWS; row++) {
        push();
        for (let col = 0; col < COLS; col++) {
            drawCircle(isColored(row, col, randomNumber));
            translate(CELL_SIZE, 0);
        }
        pop();
        translate(0, CELL_SIZE);
    }
}