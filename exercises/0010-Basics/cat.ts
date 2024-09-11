function setup() {
  createCanvas(400, 400);
  background("aqua");

  // Draw the cat's head
  fill("lightgray");
  ellipse(200, 250, 100, 100);

  // Draw the cat's ears
  triangle(160, 210, 180, 200, 170, 180);
  triangle(240, 210, 220, 200, 230, 180);

  // Draw the cat's eyes
  fill("black");
  ellipse(185, 245, 10, 10); // Left eye
  ellipse(215, 245, 10, 10); // Right eye

  // Draw the cat's nose
  fill("pink");
  triangle(195, 255, 205, 255, 200, 260);

  // Draw the cat's mouth
  line(200, 260, 200, 270); // Vertical part of the mouth
  line(200, 270, 190, 275); // Left side of the mouth
  line(200, 270, 210, 275); // Right side of the mouth

  // Draw the cat's whiskers
  line(170, 255, 190, 260); // Left upper whisker
  line(170, 265, 190, 265); // Left middle whisker
  line(170, 270, 190, 275); // Left lower whisker
  line(230, 255, 210, 260); // Right upper whisker
  line(230, 265, 210, 265); // Right middle whisker
  line(230, 270, 210, 275); // Right lower whisker

}
