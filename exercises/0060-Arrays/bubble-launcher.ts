const circleX: number[] = [];
const circleY: number[] = [];
const direction: number[] = [];

const SPEED: number = 2;
const RADI: number = 10;
const DIAM: number = RADI * 2;

function setup() {
    createCanvas(500, 300);
}

function draw() {
    background("white");

    fill('lightgray');
    stroke('darkgray');
    rect(0, 0, DIAM, height);

    fill('yellow');
    stroke('gold');
    circle(RADI, max(RADI, min(height - RADI, mouseY)), DIAM);

    for (let i = 0; i < circleX.length; i++) {
        circle(circleX[i], circleY[i], DIAM);

        circleX[i] += SPEED * direction[i];
        if (circleX[i] - RADI < 0 || circleX[i] + RADI > width) {
            direction[i] *= -1;
            circleX[i] = max(RADI, min(width - RADI, circleX[i]));
        }
    }
}

function mouseClicked() {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        circleX.push(RADI);
        circleY.push(mouseY);
        direction.push(1);
    }
}