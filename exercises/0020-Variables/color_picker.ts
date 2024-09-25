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
    const color_hue = mouseX;
    const color_saturation = Math.min(100, mouseY);

    fill(color_hue, color_saturation, 100);
    rect(0, height / 2, width, height);

    fill(0);
    text(`H: ${color_hue}, S: ${color_saturation}, B: 100`, 5, height - 5);
}