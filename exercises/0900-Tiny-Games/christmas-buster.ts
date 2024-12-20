/**
 * Christmas Tree Ball Catcher Game
 * A p5.js based game where players catch falling ornaments on a Christmas tree
 * Players must click ornaments before they disappear to score points
 * Game ends when player loses all lives
 */

// Defines structure for ornament balls
type Circle = {
    x: number,      // x-coordinate on canvas
    y: number,      // y-coordinate on canvas
    lifetime: number; // time until ball disappears
    image: p5.Image; // ball's visual appearance
  }
  
  // Game state variables
  const circles: Circle[] = [];  // active ornaments
  let nextCircle = 0;           // timestamp for next ornament spawn
  let points = 0;               // player's score
  let lives = 5;                // remaining lives
  let gameOver = false;         // game state flag
  
  // Asset URLs
  const baseUrl = "https://cddataexchange.blob.core.windows.net/images/christmas-tree";
  const treeUrl = `${baseUrl}/tree.png`;
  let treeImage: p5.Image;
  
  // Ornament assets
  const ballImages: p5.Image[] = [];
  const ballDiameter = 50;
  
  /**
   * p5.js preload function - loads all game assets before starting
   * Loads tree and ornament images
   */
  function preload() {
    treeImage = loadImage(treeUrl);
  
    // Load 9 different ornament designs
    for (let i = 1; i <= 9; i++) {
        const url = `${baseUrl}/ball${i}.png`;
        ballImages.push(loadImage(url));
    }
  }
  
  /**
   * p5.js setup function - initializes canvas
   */
  function setup() {
    createCanvas(400, 408);
  }
  
  /**
   * p5.js draw function - main game loop
   * Handles rendering and game state updates
   */
  function draw() {
    background("black");
    imageMode(CENTER);
    
    // Draw Christmas tree background
    image(treeImage, width / 2, height / 2, width, height);
  
    // Show game over screen if needed
    if (gameOver) {
        fill("red");
        textAlign(CENTER, CENTER);
        textSize(50);
        text(`Game over!\n${points} points`, width / 2, height / 2);
        return;
    }
  
    // Spawn new ornament if it's time
    if (millis() >= nextCircle) {
        // Calculate spawn position along tree edge
        const y = random(0, 650 / 2);
        const x = 400 / 2 + y * (250 / 650) / 2;
        const lifetime = millis() + random(1000, 2000);
        circles.push({
            x, y, lifetime, image: random(ballImages)
        })
  
        nextCircle = millis() + random(500, 1500);
    }
  
    // Remove expired ornaments and update lives
    for (let i = circles.length - 1; i >= 0; i--) {
        if (millis() >= circles[i].lifetime) {
            lives--;
            console.log(lives);
            gameOver = lives <= 0;
            circles.splice(i, 1);
        }
    }
  
    // Draw all active ornaments
    for (const circle of circles) {
        image(circle.image, circle.x, circle.y, ballDiameter, ballDiameter * 1.1);
    }
  
    // Display score
    noStroke();
    fill("yellow");
    textAlign(LEFT, BOTTOM);
    text(points, 10, height - 10);
  
    // Display remaining lives
    fill("red");
    textAlign(RIGHT, BOTTOM);
    textSize(20);
    text(lives, width - 10, height - 10);
  }
  
  /**
   * p5.js mouseClicked function - handles player interaction
   * Checks if player clicked on an ornament and updates score
   */
  function mouseClicked() {
    if (gameOver) {
        return;
    }
  
    // Check collision with each ornament
    for (let i = circles.length - 1; i >= 0; i--) {
        const dx = mouseX - circles[i].x;
        const dy = mouseY - circles[i].y;
        if (Math.sqrt(dx * dx + dy * dy) <= ballDiameter) {
            points += 1;
            circles.splice(i, 1);
            return;
        }
    }
  }
  