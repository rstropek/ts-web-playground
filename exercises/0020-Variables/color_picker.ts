function setup() {
    createCanvas(360, 200);
    colorMode(HSB);
    background(0, 100, 100);
    noStroke();
}

function mouseMoved() {
    fill(mouseX, mouseY, 100);
    rect(0, 0, width, height / 2);
}

function mouseClicked() {
    console.log("click")
    const colorHue: number = mouseX;
    const colorSaturation: number = min(100, mouseY);

    fill(colorHue, colorSaturation, 100);
    rect(0, height / 2, width, height);

    fill(0);
    text(`H: ${colorHue}, S: ${colorSaturation}, B: 100`, 5, height - 5);
}
