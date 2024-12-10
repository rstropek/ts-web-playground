const LENGTH = 10;

function setup() {
    createCanvas(601, 301);
    background("black");
    colorMode(HSB)

    fill("aqua");
    noStroke();

    textSize(50);
    textAlign(CENTER, CENTER);
    text("Move the mouse to start", 0, 0, width, height);
}

let initialColor = 0;

function mouseMoved() {
    resetMatrix();
    background("black");
    strokeWeight(2);

    noFill();
    const percentage = 1 + mouseX / width;

    let sideLength = LENGTH * percentage;
    for (let x = 0; x < width; x += sideLength) {
        stroke(360 * x / width % 360, 100, 100);
        push();
        for (let y = 0; y < height; y += sideLength) {
            line(0, 0, sideLength, sideLength / 2);
            line(sideLength, sideLength / 2, 0, sideLength);
            translate(0, sideLength);
        }
        pop();
        translate(sideLength, 0);
    }

    resetMatrix();
    translate(0, height - 20);
    fill("black");
    noStroke();
    rect(0, 0, width, 20);
    fill("white");
    textSize(12);
    textAlign(LEFT, CENTER);
    translate(5, 0);
    text(`${mouseX} of ${width} = ${Math.round(percentage * 100)}%`, 0, 0, width, 20);
}
