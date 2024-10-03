// Height of the black area at the bottom where
// the text is drawn.
const textAreaHeight: number = 50;

function setup() {
    createCanvas(400, 200);
    background("black");

    noStroke();

    // One-third in orange
    fill("orange");
    rect(0, 0, width / 3, height);

    // One-third in green
    fill("green");
    rect(width / 3, 0, width / 3, height);

    // One-third in red
    fill("red");
    rect(2 * width / 3, 0, width / 3, height);

    // Black area for text at the bottom
    fill("black");
    rect(0, height - textAreaHeight, width, textAreaHeight);
}

function mouseClicked() {
    // Clear black area for text at the bottom
    fill("black");
    rect(0, height - 50, width, 50);

    // Format text (experiment with the parameters to
    // find out what they mean; if unsure, ask your teacher)
    noStroke();
    fill("white");
    textSize(30);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);

    // The message variable will receive the message to print
    let message: string;

    // Note the `if` statement here. It checks if the mouse click
    // was in the left area (yellow). If it was, the message is "Yellow".
    if (mouseX < width / 3) {
        message = "Yellow";
    } else if (mouseX < width / 3 * 2) {
        // Note the `else if` statement here. If the user did not
        // click in the yellow area, it checks if the user clicked
        // in the second area (green).
        message = "Green";
    } else {
        // If the click was not in the yellow and not in the green
        // area, the click must have been in the red area.
        message = "Red";
    }

    // Draw the message on the screen
    text(message, width / 2, height - textAreaHeight / 2);
}

