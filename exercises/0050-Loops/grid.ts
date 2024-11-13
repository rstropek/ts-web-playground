function setup() {
    // We have a square canvas. The side length is defined by the constant SIZE.
    const SIZE = 400;
    // Your job is to draw a grid on the canvas. The distance between the grid lines is defined by the constant GRID.
    const GRID = 25;

    createCanvas(SIZE, SIZE);
    background("black");

    strokeWeight(0.25);
    stroke("lightgray");

    // Draw a grid by using a while loop.
    
    // Part 1: Draw vertical lines
    let i = GRID;
    while (i < SIZE) {
        line(i, 0, i, SIZE);
        i += GRID;
    }

    // Part 2: Draw horizontal lines
    i = GRID;
    while (i < SIZE) {
        line(0, i, SIZE, i);
        i += GRID;
    }
}