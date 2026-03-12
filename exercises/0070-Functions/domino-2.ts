// Diameter of one dot (also called pip) on the domino.
const dicePointDiameter: number = 30;

// Size of one square half of the domino.
const diceSize = 200;

// Gap beween domino pieces
const gap = 20;

function setup() {
    // Create the canvas for the complete domino row.
    //
    // Width:
    // We need space for 5 dominoes.
    // Each domino is 2 * diceSize wide.
    // Between the 5 dominoes there are 4 gaps.
    // Everything is scaled down to 20% with scale(0.2).
    // The extra 20 pixels give a small margin around the drawing.
    createCanvas(20 + (diceSize * 10 + gap * 4) * 0.2, 20 + diceSize * 0.2);

    // Paint the background light gray.
    background("lightgray");

    // Move the origin away from the upper-left corner of the canvas.
    // This creates a small border so the dominoes do not start directly at (0, 0).
    translate(10, 10);

    // Scale all following drawings to 20% of their original size.
    // This means the dominoes are drawn much smaller than in drawDomino().
    scale(0.2);

    // Draw 5 dominoes in a row:
    // 1:2, 2:3, 3:4, 4:5, 5:6
    for (let i: number = 1; i <= 5; i++) {
        // Draw one domino with the values i and i + 1.
        drawDomino(i, i + 1);

        // Move the origin to the right for the next domino.
        //
        // A domino is 2 * diceSize wide:
        // - left half:  diceSize
        // - right half: diceSize
        //
        // Then we add the gap between the dominoes.
        translate(diceSize * 2 + gap, 0);
    }
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