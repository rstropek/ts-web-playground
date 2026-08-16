let fighter: p5.Image;

const fighterImageWidth: number = 475;
const fighterImageHeight: number = 724;
const fighterDisplayHeight: number = 200;
const fighterDisplayWidth: number = fighterDisplayHeight * (fighterImageWidth / fighterImageHeight);
let fighterPositionX: number = 0;
let fighterPositionY: number = 0;

let stickX: number = 0;
let stickY: number = 0;
let stickOriginX: number = 0;
let stickOriginY: number = 0;
const controlStickRadius: number = 10;
const movementRadius: number = 50;
let dragging: boolean = false;

async function setup(): Promise<void> {
  fighter = await loadImage("https://cddataexchange.blob.core.windows.net/images/Spaceship.png");
  createCanvas(500, 500);
  stickOriginX = width / 2;
  stickOriginY = height - movementRadius;
}

function draw(): void {
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
  const stickCenterX: number = width / 2 + stickX;
  const stickCenterY: number = height - movementRadius + stickY;
  translate(stickCenterX, stickCenterY);
  circle(0, 0, controlStickRadius * 2);
  pop();
  
  const speedX: number = stickX / 5;
  const speedY: number = stickY / 5;
  fighterPositionX = min(max(fighterPositionX + speedX, -width / 2), width / 2);
  fighterPositionY = min(max(fighterPositionY + speedY, -height / 2), height / 2);

  push();
  noStroke();
  fill("black");
  textSize(10);
  text(`Fighter position: ${round(fighterPositionX)}, ${round(fighterPositionY)}`, 10, height - 10);
  text(`Speed: ${round(speedX)}, ${round(speedY)}`, 10, height - 22);
  pop();
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
}

function mousePressed(): void {
  const stickCenterX: number = width / 2 + stickX;
  const stickCenterY: number = height - movementRadius + stickY;
  const distanceToStick: number = distance(mouseX, mouseY, stickCenterX, stickCenterY);
  if (distanceToStick < controlStickRadius) {
    dragging = true;
  }
}

function mouseDragged(): void {
  if (dragging) {
    stickX = mouseX - stickOriginX;
    stickY = mouseY - stickOriginY;

    // Calculate the distance from the center
    const distanceFromCenter: number = distance(0, 0, stickX, stickY);
    
    // If the distance exceeds the movement radius, scale down the values
    if (distanceFromCenter > movementRadius - controlStickRadius) {
      const scale: number = (movementRadius - controlStickRadius) / distanceFromCenter;
      stickX *= scale;
      stickY *= scale;
    }
  }
}

function mouseReleased(): void {
  dragging = false;
}
