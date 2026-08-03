function setup() {
  createCanvas(200, 200);
  background("lightblue");
}

function mouseMoved() {
  const snap: number = 40; // marker must snap every 40 pixels
  const markerSize: number = 10; // size of marker

  background("lightblue");

  stroke("white");
  strokeWeight(3);
  const x: number = round(mouseX / snap) * snap;
  const y: number = round(mouseY / snap) * snap;

  line(x - markerSize, y, x + markerSize, y);
  line(x, y - markerSize, x, y + markerSize);

  fill("white");
  noStroke();
  text(`${x}/${y}`, 5, height - 5);
}
