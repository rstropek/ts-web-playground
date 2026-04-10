// ============================================================
// HONEYCOMB GRID DRAWING — p5.js sketch
// Key concepts: canvas setup, coordinate transforms, loops,
// the push/pop matrix stack, and decomposition into functions.
// ============================================================


// ─────────────────────────────────────────────────────────────
// setup()
//
// p5.js calls this ONCE automatically when the sketch starts.
// Everything here runs before the first draw() frame — since
// we have no draw(), this sketch is purely static.
// ─────────────────────────────────────────────────────────────
function setup() {
    createCanvas(450, 370);   // create a 450×370 px drawing surface
    background("black");      // fill the canvas with black
    stroke("yellow");         // all future lines will be yellow
                              // (no fill() call → shapes are outlines only)

    // Move the coordinate origin 10 px right and 10 px down.
    // Every subsequent drawing call is now relative to (10, 10),
    // giving us a small margin around the hive.
    translate(10, 10);

    drawHive();               // delegate all grid logic to its own function
}


// ─────────────────────────────────────────────────────────────
// drawHive()
//
// Draws a grid of hexagons arranged in a "brick-offset" pattern:
//   • even rows  (0, 2, 4 …) are left-aligned, 5 cells wide
//   • odd  rows  (1, 3, 5 …) are indented by 45 px,  4 cells wide
//
// The two nested loops iterate over rows (y) and columns (x).
// translate() is used to position each cell — no arithmetic in
// the caller; drawComb() always draws at the local origin.
// ─────────────────────────────────────────────────────────────
function drawHive() {

    // ── Outer loop: one iteration per ROW ──────────────────
    for (let y = 0; y < 13; y++) {

        // push() saves the current transformation matrix onto a stack.
        // Think of it as "remember where I am right now".
        // Everything between push() and pop() can translate/rotate freely;
        // pop() restores the saved state, so the outer loop's
        // translate(0, 25) below is never disturbed by inner-loop shifts.
        push();

        // Odd rows are horizontally offset to achieve the classic
        // honeycomb interlock (each cell sits in the gap of the row above).
        if (y % 2 !== 0) {          // y % 2 → remainder after dividing by 2
            translate(45, 0);       // shift the entire row 45 px to the right
        }

        // Odd rows also have one fewer cell so they fit within the canvas
        // after the 45 px indent.
        let end = 5;                // default: 5 cells per row
        if (y % 2 !== 0) {
            end--;                  // odd rows: 4 cells (end becomes 4)
        }

        // ── Inner loop: one iteration per CELL in this row ─
        for (let x = 0; x < end; x++) {

            drawComb();             // draw one hexagon at the current origin

            // Move the origin one cell-width to the right for the next cell.
            // A hexagon cell here is 25 px wide (the flat top) plus
            // two 20 px diagonal sides projected onto the x-axis → 65 px total,
            // then add 25 px horizontal gap between cells → 90 px per step.
            translate(65 + 25, 0);
        }

        // pop() restores the transformation matrix to what it was at push().
        // The horizontal translates from the inner loop are discarded.
        pop();

        // After restoring, advance downward by 25 px for the next row.
        // Hexagon rows interlock vertically: the total height of one hex is
        // 50 px (25 + 25), but adjacent rows share the diagonal edge, so
        // the vertical stride is only 25 px — exactly half the hex height.
        translate(0, 25);
    }
}


// ─────────────────────────────────────────────────────────────
// drawComb()
//
// Draws a single regular* hexagon using six line() calls.
// (* "regular" in layout — the horizontal edges are longer than
//    the diagonals in pixel length, but the proportions look
//    correct for a honeycomb.)
//
// The hexagon is defined in LOCAL coordinates: the caller is
// responsible for translating to the desired position first.
//
// Vertex layout (pixel coordinates, origin = top-left of bounding box):
//
//          (20,0) ──────── (45,0)
//         /                      \
//      (0,25)                  (65,25)
//         \                      /
//          (20,50) ──────── (45,50)
//
// Each line() call: line(x1, y1, x2, y2)
// The constants 20, 25, 45 (= 20+25), 50 (= 25+25), 65 (= 20+25+20)
// are written as arithmetic expressions to make the geometry explicit.
// ─────────────────────────────────────────────────────────────
function drawComb() {
    //    x1           y1        x2             y2
    line( 20        ,  0      ,  20 + 25     ,  0      );  // top          (horizontal)
    line( 20 + 25   ,  0      ,  20 + 25 + 20,  25     );  // top-right    (diagonal ↘)
    line( 20 + 25 + 20,  25   ,  20 + 25     ,  25 + 25);  // bottom-right (diagonal ↙)
    line( 20 + 25   ,  25 + 25,  20          ,  25 + 25);  // bottom       (horizontal)
    line( 20        ,  25 + 25,   0          ,  25     );  // bottom-left  (diagonal ↖)
    line(  0        ,  25     ,  20          ,   0     );  // top-left     (diagonal ↗)
}