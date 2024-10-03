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

    let diameterX = Math.abs((mouseX - width/2) * 2);
    diameterX = Math.round(diameterX / gridSize) * gridSize;
    let diameterY = Math.abs((mouseY - height/2) * 2);
    diameterY = Math.round(diameterY / gridSize) * gridSize;
    
    stroke("red");
    arc(width/2, height/2, diameterX, diameterY, 0, 90);
    stroke("yellow");
    arc(width/2, height/2, diameterX, diameterY, 90, 180);
    stroke("aqua");
    arc(width/2, height/2, diameterX, diameterY, 180, 270);
    stroke("lime");
    arc(width/2, height/2, diameterX, diameterY, 270, 360);

    stroke("lightgray");
    strokeWeight(1);
    line(width/2 - diameterX / 2, height/2, width/2 + diameterX / 2, height/2);
    line(width/2, height/2 - diameterY / 2, width/2, height/2 + diameterY / 2);

    noStroke();
    fill("lightgray");
    textAlign(RIGHT);
    text(`${diameterX}`, width/2 - diameterX / 2 - 5, height/2 - 5);
    text(`${diameterY}`, width/2, height/2 - diameterY/2 - 5);

    textAlign(LEFT);
    const area = Math.round(diameterX / 2 * diameterY / 2 * Math.PI);
    text(`Area: ${area}`, 5, height - 10);
}