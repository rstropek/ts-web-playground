// Size of one square half of the domino.
const diceSize = 200;

function setup() {
    // The setup function is called once at the beginning of the program.
    // It is used to prepare the drawing area.

    // Create a canvas (drawing area) with width 420 pixels and height 220 pixels.
    createCanvas(diceSize * 2 + 20, diceSize + 20);

    // Fill the whole background of the canvas with light gray.
    background("lightgray");

    // Move the coordinate system to the top-left corner of the domino.
    // This makes the next drawing commands easier.
    translate(10, 10);

    // Draw one domino with the values 4 and 5.
    // The first number is the left half, the second number is the right half.
    drawDomino(4, 5);
}

function drawDomino(symbol1: number, symbol2: number) {
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

function drawSymbol(symbol: number) {
    const centerX = diceSize / 2;
    const centerY = diceSize / 2;
    const size = 80;

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
