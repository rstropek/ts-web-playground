// This program generates a simple math quiz in a graphical window, where the user selects the correct result
// of a randomly generated arithmetic operation.

let points: number = 0; // Keeps track of the user's score
let firstNumber: number = 0; // Stores the first operand of the arithmetic operation
let secondNumber: number = 0; // Stores the second operand of the arithmetic operation
let operator: string = ''; // Stores the operator (+, -, *) of the arithmetic operation
let result1: number = 0; // First possible answer displayed
let result2: number = 0; // Second possible answer displayed
let result3: number = 0; // Third possible answer displayed
let correctResult: number = 0; // Stores the correct answer for the operation

// setup function runs once and sets up the quiz elements on the canvas
function setup() {
    createCanvas(400, 400);
    background("black");

    // Randomly select an arithmetic operator and generate operands accordingly
    const operatorIx = Math.floor(random(0, 3)); // Randomly selects 0, 1, or 2
    switch (operatorIx) {
        case 0:
            operator = '+'; // Sets operator to addition
            firstNumber = Math.floor(random(1, 101)); // Generates random first operand from 1 to 100
            secondNumber = Math.floor(random(1, 101)); // Generates random second operand from 1 to 100
            correctResult = firstNumber + secondNumber; // Computes the correct answer for addition
            break;
        case 1:
            operator = '-'; // Sets operator to subtraction
            firstNumber = Math.floor(random(1, 101)); // Random first operand from 1 to 100
            secondNumber = Math.floor(random(1, firstNumber + 1)); // Second operand from 1 to the value of first operand (avoids negative results)
            correctResult = firstNumber - secondNumber; // Computes the correct answer for subtraction
            break;
        default:
            operator = '*'; // Sets operator to multiplication
            firstNumber = Math.floor(random(1, 11)); // Random first operand from 1 to 10 (keeps numbers manageable)
            secondNumber = Math.floor(random(1, 11)); // Random second operand from 1 to 10
            correctResult = firstNumber * secondNumber; // Computes the correct answer for multiplication
            break;
    }

    // Generates three possible answer options
    result1 = Math.floor(random(1, 101)); // Random answer option 1
    result2 = Math.floor(random(1, 101)); // Random answer option 2
    result3 = Math.floor(random(1, 101)); // Random answer option 3

    // Randomly assign the correct answer to one of the result variables
    const correctIx = Math.floor(random(0, 3)); // Randomly selects 0, 1, or 2
    switch (correctIx) {
        case 0: result1 = correctResult; break; // Assigns correct answer to result1 if index is 0
        case 1: result2 = correctResult; break; // Assigns correct answer to result2 if index is 1
        default: result3 = correctResult; break; // Assigns correct answer to result3 if index is 2
    }

    // Display the math operation and answer choices on the canvas
    fill('yellow'); // Sets text color to yellow for readability
    noStroke();

    textSize(60);

    textAlign(RIGHT, CENTER); // Aligns text to the right for the first operand
    text(firstNumber, width / 2 - 30, 75); // Displays the first operand
    textAlign(CENTER, CENTER); // Centers the text for the operator
    text(operator, width / 2, 75); // Displays the operator
    textAlign(LEFT, CENTER); // Aligns text to the left for the second operand
    text(secondNumber, width / 2 + 30, 75); // Displays the second operand

    const third = width / 3; // Divides the canvas width into three equal sections
    textAlign(CENTER, CENTER); // Centers text for answer choices
    text(result1, third / 2, height / 2); // Displays answer option 1 in the first section
    text(result2, third + third / 2, height / 2); // Displays answer option 2 in the second section
    text(result3, 2 * third + third / 2, height / 2); // Displays answer option 3 in the third section
}

// mouseClicked function checks if the user clicked on the correct answer
function mouseClicked() {
    const third = width / 3; // Defines the width of each answer section
    let toCheck: number; // Variable to store the selected answer
    if (mouseY > height / 2 - 50 && mouseY < height / 2 + 50) { // Checks if the click is within answer area
        if (mouseX < third) {
            toCheck = result1; // Assigns result1 if click is in first section
        } else if (mouseX < third * 2) {
            toCheck = result2; // Assigns result2 if click is in second section
        } else {
            toCheck = result3; // Assigns result3 if click is in third section
        }

        noStroke();
        textSize(60);
        textAlign(CENTER, CENTER); // Centers feedback text

        // Checks if selected answer matches the correct result
        if (toCheck === correctResult) {
            fill("green");
            text(`${toCheck} ist richtig!`, width / 2, height - 75);
        } else {
            fill("red");
            text(`${toCheck} ist falsch!`, width / 2, height - 75);
        }
    }
}

// mouseMoved function displays mouse coordinates as feedback
function mouseMoved() {
    fill("black");
    noStroke();
    rect(0, height - 20, width, height); // Draws a rectangle to clear previous coordinates

    fill("white");
    textSize(10);
    textAlign(LEFT, BOTTOM); // Aligns coordinates text to bottom-left
    text(`${mouseX}/${mouseY}`, 5, height - 5); // Displays current mouse coordinates
}
