function setup() {
  createCanvas(200, 200);
  background("lightblue");

  noStroke();
  fill("aqua");
  circle(0, 0, 20);

  fill("black");
  text(click_positions, 5, 5, width - 10, height - 10);
}

let click_positions: string = '0/0'

function mouseClicked() {
  background("lightblue");

  fill("aqua");
  circle(mouseX, mouseY, 20);
  click_positions = `${click_positions}, ${mouseX}/${mouseY}`;

  fill("lightblue");
  rect(0, 0, width, 20);
  fill("black");
  text(click_positions, 5, 5, width - 10, height - 10);
}