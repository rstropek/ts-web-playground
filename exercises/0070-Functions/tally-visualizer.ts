// Exercise: Tally Mark Visualizer (Strichliste)
// ==============================================
// A grid of 10 rows × 10 groups of 5 tally marks = 500 total.
// A random number n (0–500) determines how many marks are colored.

// Layout constants
const GROUPS_PER_ROW = 10;
const ROWS = 10;
const MARKS_PER_GROUP = 5;
const TOTAL = ROWS * GROUPS_PER_ROW * MARKS_PER_GROUP; // 500

const GROUP_W = 42;   // width of one tally group
const GROUP_H = 36;   // height of the vertical strokes
const COL_GAP = 10;   // gap between groups
const ROW_GAP = 16;   // gap between rows
const MARGIN = 16;
const TITLE_HEIGHT = 30;

const CELL_W = GROUP_W + COL_GAP;
const CELL_H = GROUP_H + ROW_GAP;

// Colors
const COLOR_FILLED = "steelblue";
const COLOR_EMPTY  = "lightgray";

// The random number to visualize (0–500)
let randomNumber: number;

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Returns the sequential index of the tally group at (row, col).
 */
function groupIndex(row: number, col: number): number {
    return row * GROUPS_PER_ROW + col;
}

/**
 * Returns how many marks (0–5) in the group at (row, col) should be colored,
 * given the total count n.
 *
 * @param row - zero-based row index
 * @param col - zero-based column index
 * @param n   - total number of colored marks (0–500)
 */
function coloredMarksInGroup(row: number, col: number, n: number): number {
    const firstMarkOfGroup = groupIndex(row, col) * MARKS_PER_GROUP;
    return constrain(n - firstMarkOfGroup, 0, MARKS_PER_GROUP);
}

/**
 * Draws one tally group at the current origin (0, 0).
 * `colored` marks (0–5) are drawn in COLOR_FILLED, the rest in COLOR_EMPTY.
 *
 * Mark layout (x positions of the 4 vertical strokes, evenly spaced):
 *   stroke 1–4: vertical lines
 *   stroke 5:   diagonal line crossing through all four
 *
 * @param colored - how many of the 5 marks are colored (0–5)
 */
function drawGroup(colored: number): void {
    push();
    strokeWeight(2.5);
    strokeCap(ROUND);

    const spacing = GROUP_W / 4;  // distance between vertical strokes

    stroke(COLOR_FILLED);

    // Draw colored vertical strokes only
    for (let i = 0; i < Math.min(colored, 4); i++) {
        const x = i * spacing;
        line(x, 0, x, GROUP_H);
    }

    // Draw diagonal only if 5th mark is colored
    if (colored >= 5) {
        line(-4, GROUP_H * 0.8, GROUP_W + 4, GROUP_H * 0.2);
    }

    pop();
}

// ─── p5.js entry point ────────────────────────────────────────────────────────

function setup(): void {
    const canvasW = GROUPS_PER_ROW * CELL_W + 2 * MARGIN;
    const canvasH = ROWS * CELL_H + TITLE_HEIGHT + MARGIN;
    createCanvas(canvasW, canvasH);

    randomNumber = Math.floor(Math.random() * (TOTAL + 1));

    background("white");

    // Title
    noStroke();
    fill("black");
    textSize(14);
    textAlign(CENTER);
    text(`Random number: ${randomNumber} / ${TOTAL}`, width / 2, 20);

    // Draw grid — translate steps right per group, down per row
    translate(MARGIN, TITLE_HEIGHT + ROW_GAP / 2);
    for (let row = 0; row < ROWS; row++) {
        push();
        for (let col = 0; col < GROUPS_PER_ROW; col++) {
            drawGroup(coloredMarksInGroup(row, col, randomNumber));
            translate(CELL_W, 0);
        }
        pop();
        translate(0, CELL_H);
    }
}