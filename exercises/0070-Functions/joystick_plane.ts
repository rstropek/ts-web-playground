let fighter: p5.Image;

const fighterImageWidth = 475;
const fighterImageHeight = 724;
const fighterDisplayHeight = 200;
const fighterDisplayWidth = fighterDisplayHeight * (fighterImageWidth / fighterImageHeight);
let fighterPositionX = 0;
let fighterPositionY = 0;

let stickX = 0;
let stickY = 0;
let stickOriginX = 0;
let stickOriginY = 0;
const controlStickRadius = 10;
const movementRadius = 50;
let dragging = false;

function preload() {
  fighter = loadImage("https://cddataexchange.blob.core.windows.net/images/Spaceship.png");
}

function setup() {
  createCanvas(500, 500);
  stickOriginX = width / 2;
  stickOriginY = height - movementRadius;
}

function draw() {
  background("lightblue");

  push();
  stroke("black");
  strokeWeight(1);
  noFill();
  rect(0, 0, width, height);
  pop();
  
  push();
  imageMode(CENTER);
  translate(width / 2 + fighterPositionX, height / 2 + fighterPositionY);
  image(fighter, 0, 0, fighterDisplayWidth, fighterDisplayHeight);
  pop();
  
  push();
  stroke("red");
  strokeWeight(1);
  fill("white");
  translate(width / 2, height - movementRadius);
  circle(0, 0, movementRadius * 2);
  pop();

  push();
  noStroke();
  fill("black");
  const stickCenterX = width / 2 + stickX;
  const stickCenterY = height - movementRadius + stickY;
  translate(stickCenterX, stickCenterY);
  circle(0, 0, controlStickRadius * 2);
  pop();
  
  const speedX = stickX / 5;
  const speedY = stickY / 5;
  fighterPositionX = Math.min(Math.max(fighterPositionX + speedX, -width / 2), width / 2);
  fighterPositionY = Math.min(Math.max(fighterPositionY + speedY, -height / 2), height / 2);

  push();
  noStroke();
  fill("black");
  textSize(10);
  text(`Fighter position: ${Math.round(fighterPositionX)}, ${Math.round(fighterPositionY)}`, 10, height - 10);
  text(`Speed: ${Math.round(speedX)}, ${Math.round(speedY)}`, 10, height - 22);
  pop();
}

function mousePressed() {
  const stickCenterX = width / 2 + stickX;
  const stickCenterY = height - movementRadius + stickY;
  const distanceToStick = Math.sqrt(Math.pow(mouseX - stickCenterX, 2) + Math.pow(mouseY - stickCenterY, 2));
  if (distanceToStick < controlStickRadius) {
    dragging = true;
  }
}

function mouseDragged() {
  if (dragging) {
    stickX = mouseX - stickOriginX;
    stickY = mouseY - stickOriginY;

    // Calculate the distance from the center
    const distance = Math.sqrt(stickX * stickX + stickY * stickY);
    
    // If the distance exceeds the movement radius, scale down the values
    if (distance > movementRadius - controlStickRadius) {
      const scale = (movementRadius - controlStickRadius) / distance;
      stickX *= scale;
      stickY *= scale;
    }
  }
}

function mouseReleased() {
  dragging = false;
}

