function setup() {
    createCanvas(400, 200);
    background("black");
    angleMode(DEGREES);
}

function mouseMoved() {
    const gridSize = 20;

    background("black");

    strokeWeight(2);
    noFill();

    let snapX: number = round(mouseX / gridSize) * gridSize;
    let snapY: number = round(mouseY / gridSize) * gridSize;
    let rectWidth: number = abs(width - 2 * snapX);
    let rectHeight: number = abs(height - 2 * snapY);
    
    stroke("red");
    line(snapX, snapY, snapX, height - snapY);
    stroke("yellow");
    line(snapX, height - snapY, width - snapX, height - snapY);
    stroke("aqua");
    line(width - snapX, height - snapY, width - snapX, snapY);
    stroke("lime");
    line(width - snapX, snapY, snapX, snapY);

    stroke("lightgray");
    strokeWeight(1);
    line(snapX, snapY, width - snapX, height - snapY);
    line(snapX, height - snapY, width - snapX, snapY);

    noStroke();
    fill("lightgray");
    textAlign(RIGHT, CENTER);
    text(`${rectWidth}`, snapX - 5, height / 2);
    textAlign(CENTER, BOTTOM);
    text(`${rectHeight}`, width / 2, height - snapY - 5);

    textAlign(LEFT);
    const area = rectWidth * rectHeight;
    text(`Area: ${area}`, 5, height - 10);
}