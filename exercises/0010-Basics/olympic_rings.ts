function setup() {
    createCanvas(400, 200);
    noFill(); // We only need the outlines
    strokeWeight(5); // Set the thickness of the ring outlines

    // Draw the Olympic rings using circles
    // Blue ring
    stroke("blue");
    circle(100, 100, 80);

    // Black ring
    stroke("black");
    circle(200, 100, 80);

    // Red ring
    stroke("red");
    circle(300, 100, 80);

    // Yellow ring
    stroke("yellow");
    circle(150, 140, 80);

    // Green ring
    stroke("green");
    circle(250, 140, 80);
}
