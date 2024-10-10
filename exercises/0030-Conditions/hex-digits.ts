function setup() {
    const num = Math.floor(random(0, Math.pow(16, 3)));

    const digit1 = Math.floor(num / Math.pow(16, 0)) % 16;
    const digit2 = Math.floor(num / Math.pow(16, 1)) % 16;
    const digit3 = Math.floor(num / Math.pow(16, 2)) % 16;

    createCanvas(300, 300);
    background("black");

    noFill();
    stroke("yellow");

    rect(50 + 0 * 75, 100, 50, 75);
    rect(50 + 1 * 75, 100, 50, 75);
    rect(50 + 2 * 75, 100, 50, 75);

    textAlign(CENTER, CENTER);
    fill("yellow");
    noStroke();

    text(num, width / 2, height - 20);

    textSize(30);

    if (digit3 < 10) {
        text(digit3, 75 + 0 * 75, 100 + 75 / 2);
    } else if (digit3 === 10) {
        text('A', 75 + 0 * 75, 100 + 75 / 2);
    } else if (digit3 === 11) {
        text('B', 75 + 0 * 75, 100 + 75 / 2);
    } else if (digit3 === 12) {
        text('C', 75 + 0 * 75, 100 + 75 / 2);
    } else if (digit3 === 13) {
        text('D', 75 + 0 * 75, 100 + 75 / 2);
    } else if (digit3 === 14) {
        text('E', 75 + 0 * 75, 100 + 75 / 2);
    } else if (digit3 === 15) {
        text('F', 75 + 0 * 75, 100 + 75 / 2);
    }

    if (digit2 < 10) {
        text(digit2, 75 + 1 * 75, 100 + 75 / 2);
    } else if (digit2 === 10) {
        text('A', 75 + 1 * 75, 100 + 75 / 2);
    } else if (digit2 === 11) {
        text('B', 75 + 1 * 75, 100 + 75 / 2);
    } else if (digit2 === 12) {
        text('C', 75 + 1 * 75, 100 + 75 / 2);
    } else if (digit2 === 13) {
        text('D', 75 + 1 * 75, 100 + 75 / 2);
    } else if (digit2 === 14) {
        text('E', 75 + 1 * 75, 100 + 75 / 2);
    } else if (digit2 === 15) {
        text('F', 75 + 1 * 75, 100 + 75 / 2);
    }

    if (digit1 < 10) {
        text(digit1, 75 + 2 * 75, 100 + 75 / 2);
    } else if (digit1 === 10) {
        text('A', 75 + 2 * 75, 100 + 75 / 2);
    } else if (digit1 === 11) {
        text('B', 75 + 2 * 75, 100 + 75 / 2);
    } else if (digit1 === 12) {
        text('C', 75 + 2 * 75, 100 + 75 / 2);
    } else if (digit1 === 13) {
        text('D', 75 + 2 * 75, 100 + 75 / 2);
    } else if (digit1 === 14) {
        text('E', 75 + 2 * 75, 100 + 75 / 2);
    } else if (digit1 === 15) {
        text('F', 75 + 2 * 75, 100 + 75 / 2);
    }
}
