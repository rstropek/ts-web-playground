function setup() {
    const SIZE = 400; // Canvas size (square)
    const GRID = 25; // Grid line distance

    createCanvas(SIZE, SIZE);
    background("black");

    strokeWeight(0.25);
    stroke("lightgray");

    // Draw vertical lines
    let i = GRID;
    while (i < SIZE) {
        line(i, 0, i, SIZE);
        i += GRID;
    }

    // Draw horizontal lines
    i = GRID;
    while (i < SIZE) {
        line(0, i, SIZE, i);
        i += GRID;
    }

    strokeWeight(2);
    
    // Draw left part of the lines
    stroke("yellow");
    i = GRID;
    while (i < SIZE) {
        line(GRID, i, GRID * (i / GRID), i);
        i += GRID;
    }

    // Draw right part of the lines
    stroke("red");
    i = GRID;
    while (i < SIZE) {
        line(GRID * (i / GRID), i, SIZE - GRID, i);
        i += GRID;
    }
}