/**
 * Sokoban Game Implementation
 * 
 * This file implements a classic Sokoban puzzle game where the player pushes
 * crates to designated spots. The game uses p5.js for rendering.
 * 
 * Game symbols:
 * X - Wall
 * @ - Player
 * b - Box/Crate
 * . - Target spot
 * B - Box on target
 * _ - Empty space (not rendered)
 * Space - Floor
 */

// Base URL for all game assets
const baseUrl = 'https://cddataexchange.blob.core.windows.net/data-exchange/sokoban';

// List of image assets to be loaded
// These correspond to different game elements (walls, floor, targets, crates)
const imageNames = [
    `${baseUrl}/Blocks/block_06.png`,  // Wall
    `${baseUrl}/Ground/ground_01.png`, // Floor
    `${baseUrl}/Ground/ground_04.png`, // Target
    `${baseUrl}/Crates/crate_43.png`,  // Box/Crate
    `${baseUrl}/Crates/crate_08.png`   // Box on target
];

// Array to store loaded p5 image objects
const images: p5.Image[] = [];

// Collection of game levels as string representations
// Each character represents a game element according to the symbol legend
const levels = [
  `XXXXX__
X   X__
X@XbXXX
X b ..X
XXXXXXX`,
  `XXXXXXX
X.   .X
X  b  X
X b@b X
X  b  X
X.   .X
XXXXXXX`,
  `XXXXXXX
X.   .X
X.bbb.X
XXb@bXX
X.bbb.X
X.   .X
XXXXXXX`,
  `__XXXXX_
XXX   X_
X.@b  X_
XXX b.X_
X.XXb X_
X X . XX
Xb Bbb.X
X   .  X
XXXXXXXX`,
  `____XXXXX_____________
____X   X_____________
____Xb  X_____________
__XXX  bXXX___________
__X  b  b X___________
XXX X XXX X     XXXXXX
X   X XXX XXXXXXX  ..X
X b  b             ..X
XXXXX XXXX X@XXXX  ..X
____X      XXX__XXXXXX
____XXXXXXXX__________`
];

// Current level being displayed
const levelString = levels[0];

// 2D array to store the level grid after parsing
let level: string[][] = [];

// Tracks the maximum width of any row in the level for canvas sizing
let maxWidth = 0;

/**
 * Preload function - runs before setup
 * Loads all required game assets and parses the level data
 */
function preload() {
    // Load all images from the imageNames array
    for (const imageName of imageNames) {
        images.push(loadImage(imageName));
    }

    // Parse the level string into a 2D array
    for (const line of levelString.split('\n')) {
        const chars = line.split('');
        // Track the maximum width to properly size the canvas
        if (chars.length > maxWidth) {
            maxWidth = chars.length;
        }

        level.push(chars);
    }
}

/**
 * Returns the appropriate image for a given tile type
 * @param type - The character symbol representing the tile type
 * @returns The corresponding p5.Image object
 */
function getBlockImageBySymbol(type: string): p5.Image {
    switch (type) {
        case "X":  // Wall
            return images[0];
        case ".":  // Target spot
            return images[2];
        case "b":  // Box/Crate
            return images[3];
        case "B":  // Box on target
            return images[4];
        default:   // Floor or player (currently rendered as floor)
            return images[1];
    }
}

// Size of each cell in pixels
const cellSize = 64;

/**
 * Setup function - initializes the canvas and draws the initial game state
 * This runs once when the program starts
 */
function setup() {
    // Create a canvas sized to fit the level dimensions
    createCanvas(maxWidth * cellSize, level.length * cellSize);
    background('white');

    // Iterate through each row of the level
    for (const row of level) {
        push();  // Save the current transformation state
        for (const cell of row) {
            // Only render cells that aren't empty space
            if (cell !== '_') {
                const img = getBlockImageBySymbol(cell);
                image(img, 0, 0, cellSize, cellSize);
            }

            // Move to the next cell position horizontally
            translate(cellSize, 0);
        }

        pop();  // Restore the previous transformation state
        // Move to the next row
        translate(0, cellSize);
    }
}