function setup() {
    createCanvas(200, 200);
    background("black");

    const dice = Math.floor(random(1, 7));

    let message: string;
    switch (dice) {
        case 1: message = "Eins"; break;
        case 2: message = "Zwei"; break;
        case 3: message = "Drei"; break;
        case 4: message = "Vier"; break;
        case 5: message = "Fünf"; break;
        default: message = "Sechs"; break;
    }

    textAlign(CENTER, CENTER);
    noStroke();
    fill("yellow");
    textSize(50);
    text(message, width / 2, height / 2);
}