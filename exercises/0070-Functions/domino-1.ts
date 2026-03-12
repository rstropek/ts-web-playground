// Diameter of one dot (also called pip) on the domino.
const dicePointDiameter: number = 30;

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

    // Draw one domino with the values 5 and 6.
    // The first number is the left half, the second number is the right half.
    drawDomino(5, 6);
}

function drawDomino(dice1: number, dice2: number) {
    // Save current origin
    push();

    // Set the fill color for shapes to black.
    fill("black");

    // Turn off outlines for shapes.
    noStroke();

    // Draw the black background of the domino.
    rect(0, 0, diceSize * 2, diceSize);

    // Draw the left half of the domino.
    drawDice(dice1);

    // Move to the right.
    // Now the origin is at the top-left corner of the right half.
    translate(diceSize, 0);

    // Draw the right half of the domino.
    drawDice(dice2);

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

function drawDice(dice: number) {
    // Set the fill color of the dots to white.
    fill("white");

    // Draw the center dot for 1, 3, and 5.
    // These numbers always contain a middle point.
    if (dice === 1 || dice === 3 || dice === 5) {
        circle(diceSize / 2, diceSize / 2, dicePointDiameter);
    }

    // Draw the top-left and bottom-right dots for all numbers except 1.
    // That means for 2, 3, 4, 5, and 6.
    if (dice !== 1) {
        circle(diceSize / 4, diceSize / 4, dicePointDiameter);
        circle(3 * diceSize / 4, 3 * diceSize / 4, dicePointDiameter);
    }

    // Draw the top-right and bottom-left dots for 4, 5, and 6.
    if (dice >= 4) {
        circle(3 * diceSize / 4, diceSize / 4, dicePointDiameter);
        circle(diceSize / 4, 3 * diceSize / 4, dicePointDiameter);
    }

    // Draw the two middle side dots only for 6.
    if (dice === 6) {
        circle(diceSize / 4, diceSize / 2, dicePointDiameter);
        circle(3 * diceSize / 4, diceSize / 2, dicePointDiameter);
    }
}