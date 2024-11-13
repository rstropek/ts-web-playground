function setup() {
    const SIZE = 425; // Canvas size
    const GRID = 25;  // Size of the squares

    createCanvas(SIZE, SIZE);
    background("black");

    noStroke();

    let i = GRID;
    while (i < SIZE - GRID) {
        fill("yellow");
        rect(i, i, GRID, GRID);

        fill("lime");
        rect(i, height- GRID - i, GRID, GRID);
        
        i += GRID;
    }
}
