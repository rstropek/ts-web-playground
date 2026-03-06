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

/**
 * Returns the sequential index of the tally group at (row, col).
 * Groups are counted left-to-right, top-to-bottom, starting at 0.
 *
 * Example for a 10-column grid:
 *   row=0, col=0 → index 0    (first group)
 *   row=0, col=9 → index 9    (last group in first row)
 *   row=1, col=0 → index 10   (first group in second row)
 */
function groupIndex(row: number, col: number): number {
    return row * GROUPS_PER_ROW + col;
}

/**
 * Returns how many marks (0–5) in the group at (row, col) should be colored,
 * given the total count n.
 *
 * Each group "owns" marks [firstMark .. firstMark+4].
 * We subtract the index of the first mark in this group from n,
 * then clamp the result to the valid range 0–5:
 *   - If n hasn't reached this group yet → result is negative → clamp to 0
 *   - If n covers this group fully       → result is ≥ 5      → clamp to 5
 *   - If n lands inside this group       → result is 1–4      → exact remainder
 *
 * Example: n=23, group at index 4 → firstMark = 4*5 = 20 → 23-20 = 3 colored marks
 *
 * @param row - zero-based row index
 * @param col - zero-based column index
 * @param n   - total number of colored marks (0–500)
 */
function coloredMarksInGroup(row: number, col: number, n: number): number {
    const firstMarkOfGroup = groupIndex(row, col) * MARKS_PER_GROUP;
    return Math.max(0, Math.min(MARKS_PER_GROUP, n - firstMarkOfGroup));
}

/**
 * Draws one tally group at the current origin (0, 0).
 * Only the first `colored` marks are drawn; the rest are skipped entirely.
 *
 * A tally group has 5 marks:
 *   Marks 1–4: vertical lines, evenly spaced across GROUP_W
 *   Mark  5:   diagonal line striking through all four verticals
 *
 * The 4 vertical lines are placed at x = 0, spacing, 2*spacing, 3*spacing
 * where spacing = GROUP_W / 4. The diagonal slightly overshoots the group
 * width on both sides (-4 and GROUP_W+4) for a natural hand-drawn look.
 *
 * push()/pop() ensures that strokeWeight, strokeCap and stroke color set
 * here do not affect anything drawn outside this function.
 *
 * @param colored - how many of the 5 marks are colored (0–5)
 */
function drawGroup(colored: number): void {
    push();
    strokeWeight(2.5);
    strokeCap(ROUND);   // rounded line ends look more like hand-drawn strokes

    // All drawn strokes share the same color — set it once before the loops
    stroke(COLOR_FILLED);

    const spacing = GROUP_W / 4;  // distance between vertical strokes

    // Draw only the colored vertical strokes (marks 1–4).
    // Math.min(colored, 4) ensures we never draw more than 4 vertical lines,
    // even if colored is 5 — the 5th mark is the diagonal, handled separately.
    for (let i = 0; i < Math.min(colored, 4); i++) {
        const x = i * spacing;
        line(x, 0, x, GROUP_H);
    }

    // The 5th mark is a diagonal crossing all four verticals.
    // It is only drawn when all 5 marks in this group are colored.
    if (colored >= 5) {
        line(-4, GROUP_H * 0.8, GROUP_W + 4, GROUP_H * 0.2);
    }

    pop();
}

function setup(): void {
    const canvasW = GROUPS_PER_ROW * CELL_W + 2 * MARGIN;
    const canvasH = ROWS * CELL_H + TITLE_HEIGHT + MARGIN;
    createCanvas(canvasW, canvasH);

    // +1 so that TOTAL (500) is included as a possible value
    randomNumber = Math.floor(Math.random() * (TOTAL + 1));

    background("white");

    // Display the random number as a centered title above the grid
    noStroke();
    fill("black");
    textSize(14);
    textAlign(CENTER);
    text(`Random number: ${randomNumber} / ${TOTAL}`, width / 2, 20);

    // Move the origin to the top-left corner of the first tally group.
    // All subsequent translates are relative to this starting point.
    translate(MARGIN, TITLE_HEIGHT + ROW_GAP / 2);

    for (let row = 0; row < ROWS; row++) {
        // push() saves the current origin (start of this row).
        // The inner loop will translate rightward for each column,
        // so pop() at the end resets the x position back for the next row.
        push();
        for (let col = 0; col < GROUPS_PER_ROW; col++) {
            drawGroup(coloredMarksInGroup(row, col, randomNumber));
            // Step one cell to the right — no x coordinate calculation needed
            translate(CELL_W, 0);
        }
        pop(); // restore x to the beginning of the row

        // Step one cell downward for the next row
        translate(0, CELL_H);
    }
}