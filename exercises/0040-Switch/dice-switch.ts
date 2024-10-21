function setup() {
    // Diameter of a point from the dice
    const dicePointDiameter: number = 30;

    createCanvas(200, 200);
    background("black");

    // Generate an integer random number 
    // between 1 (including) and 7 (excluding)
    const dice = Math.floor(random(1, 7));

    noStroke();
    fill("white");
    switch (dice) {
        case 1:
            // One point in the middle of the dice
            circle(width / 2, height / 2, dicePointDiameter);
            break;
        case 2:
            // One point in the left upper corner, one
            // in the lower right corner
            circle(width / 4, height / 4, dicePointDiameter);
            circle(3 * width / 4, 3 * height / 4, dicePointDiameter);
            break;
        case 3:
            // Draw three dots (combination of 1 and 2)
            // <<< Add code here
            break;
        // <<< ... add the other cases here
    }
}