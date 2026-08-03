function setup() {
    createCanvas(500, 500);
    colorMode(HSB);
    background(0);
    noStroke();
}

let colorHue: number = 0;

function mouseMoved() {
    fill(colorHue, 100, 100);
    circle(mouseX, mouseY, 40);

    colorHue = (colorHue + 5) % 360;
}
