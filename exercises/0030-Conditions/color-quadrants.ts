// Height of the black area at the bottom where
// the text is drawn.
const textAreaHeight: number = 50;
const textAreaWidth: number = 200;

function setup() {
    createCanvas(400, 200);
    background("black");

    noStroke();

    // Left-upper quadrant
    fill("orange");
    rect(0, 0, width / 2, height / 2);

    // Right-upper quadrant
    fill("green");
    rect(width / 2, 0, width / 2, height / 2);

    // Right-lower quadrant
    fill("red");
    rect(width / 2, height / 2, width / 2, height / 2);

    // Left-lower quadrant
    fill("blue");
    rect(0, height / 2, width / 2, height / 2);

    // Black area for text at the bottom
    fill("black");
    rect(width / 2 - textAreaWidth / 2, height / 2 - textAreaHeight / 2, textAreaWidth, textAreaHeight);
}

function mouseClicked() {
    // Clear black area for text at the bottom
    fill("black");
    rect(width / 2 - textAreaWidth / 2, height / 2 - textAreaHeight / 2, textAreaWidth, textAreaHeight);

    // Format text (experiment with the parameters to
    // find out what they mean; if unsure, ask your teacher)
    noStroke();
    fill("white");
    textSize(30);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);

    // The message variable will receive the message to print
    let message: string;

    if (mouseX < width / 2) {
        // Left half

        if (mouseY < height / 2) {
            // Upper half
            message = "Orange";
        } else {
            // Lower half
            message = "Blue"
        }
    } else {
        // Right half

        if (mouseY < height / 2) {
            // Upper half
            message = "Green";
        } else {
            // Lower half
            message = "Red"
        }
    }

    // Draw the message on the screen
    text(message, width / 2, height / 2);
}

