// Size of one square half of the domino.
const diceSize: number = 200;

function setup(): void {
    // The setup function is called once at the beginning of the program.
    // It is used to prepare the drawing area.

    // Create a canvas (drawing area) with width 420 pixels and height 220 pixels.
    createCanvas(diceSize * 2 + 20, diceSize + 20);

    // Fill the whole background of the canvas with light gray.
    background("lightgray");

    // Move the coordinate system to the top-left corner of the domino.
    // This makes the next drawing commands easier.
    translate(10, 10);

    // Pick two random symbol numbers between 1 and 6.
    const symbol1: number = floor(random(1, 7));
    const symbol2: number = floor(random(1, 7));

    // Draw one domino with the two random symbols.
    // The first number is the left half, the second number is the right half.
    drawDomino(symbol1, symbol2);
}

function drawDomino(symbol1: number, symbol2: number): void {
    // Save current origin
    push();

    // Set the fill color for shapes to black.
    fill("black");

    // Turn off outlines for shapes.
    noStroke();

    // Draw the black background of the domino.
    rect(0, 0, diceSize * 2, diceSize);

    // Draw the left half of the domino.
    drawSymbol(symbol1);

    // Move to the right.
    // Now the origin is at the top-left corner of the right half.
    translate(diceSize, 0);

    // Draw the right half of the domino.
    drawSymbol(symbol2);

    // Set the dividing line color to white.
    stroke("white");

    // Set the thickness of the line.
    strokeWeight(5);

    // Draw the dividing line.
    // Since we already moved to the right,
    // x = 0 is now exactly the center line between both halves.
    line(0, 20, 0, diceSize - 20);

    // Restore original origin
    pop();
}

function drawSymbol(symbol: number): void {
    const centerX: number = diceSize / 2;
    const centerY: number = diceSize / 2;
    const size: number = 80;

    // Draw different symbols based on the number
    switch (symbol) {
        case 1:
            // Square
            fill("white");
            stroke("white");
            strokeWeight(2);
            rectMode(CENTER);
            rect(centerX, centerY, size, size);
            rectMode(CORNER);
            noStroke();
            break;
        case 2:
            // Circle
            fill("white");
            circle(centerX, centerY, size);
            break;
        case 3:
            // Triangle
            fill("white");
            stroke("white");
            strokeWeight(2);
            triangle(
                centerX, centerY - size / 2,
                centerX - size / 2, centerY + size / 2,
                centerX + size / 2, centerY + size / 2
            );
            noStroke();
            break;
        case 4:
            // Star emoji ⭐
            textAlign(CENTER, CENTER);
            textSize(size);
            text("⭐", centerX, centerY);
            break;
        case 5:
            // Heart emoji ❤️
            textAlign(CENTER, CENTER);
            textSize(size);
            text("❤️", centerX, centerY);
            break;
        case 6:
            // Lucky charm emoji 🍀
            textAlign(CENTER, CENTER);
            textSize(size);
            text("🍀", centerX, centerY);
            break;
    }
}
