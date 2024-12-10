const LENGTH = 10;

function setup() {
    createCanvas(601, 301);
    background("black");

    fill("aqua");
    noStroke();

    textSize(50);
    textAlign(CENTER, CENTER);
    text("Move the mouse to start", 0, 0, width, height);
}

function mouseMoved() {
    resetMatrix();
    background("black");
    strokeWeight(2);

    noFill();
    stroke("aqua");

    for (let x = 0; x < width; x += LENGTH) {
        push();
        for (let y = 0; y < height; y += LENGTH) {
            line(0, 0, LENGTH, LENGTH / 2);
            line(LENGTH, LENGTH / 2, 0, LENGTH);
            translate(0, LENGTH);
        }
        pop();
        translate(LENGTH, 0);
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
    text(`${mouseX} of ${width}`, 0, 0, width, 20);
}
