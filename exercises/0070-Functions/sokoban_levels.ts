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
const baseUrl: string = 'https://cddataexchange.blob.core.windows.net/data-exchange/sokoban';

// List of image assets to be loaded
// These correspond to different game elements (walls, floor, targets, crates)
const imageNames: string[] = [
    `${baseUrl}/Blocks/block_06.png`,  // Wall
    `${baseUrl}/Ground/ground_01.png`, // Floor
    `${baseUrl}/Ground/ground_04.png`, // Target
    `${baseUrl}/Crates/crate_43.png`,  // Box/Crate
    `${baseUrl}/Crates/crate_08.png`   // Box on target
];

// Array to store loaded p5 image objects
const images: p5.Image[] = [];

// Current level being displayed
const levelString: string = levels[0];

// 2D array to store the level grid after parsing
let level: string[][] = [];

// Tracks the maximum width of any row in the level for canvas sizing
let maxWidth: number = 0;

/**
 * Setup function - loads all required game assets, parses the level data,
 * and initializes the canvas
 */
async function setup(): Promise<void> {
    // Load all images from the imageNames array, one after the other
    for (const imageName of imageNames) {
        const loadedImage: p5.Image = await loadImage(imageName);
        images.push(loadedImage);
    }

    // Parse the level string into a 2D array
    for (const line of levelString.split('\n')) {
        const chars: string[] = line.split('');
        // Track the maximum width to properly size the canvas
        if (chars.length > maxWidth) {
            maxWidth = chars.length;
        }

        level.push(chars);
    }
    // Create a canvas sized to fit the level dimensions
    createCanvas(maxWidth * cellSize, level.length * cellSize);
    background('white');

    // Iterate through each row of the level
    for (const row of level) {
        push();  // Save the current transformation state
        for (const cell of row) {
            // Only render cells that aren't empty space
            if (cell !== '_') {
                const img: p5.Image = getBlockImageBySymbol(cell);
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
const cellSize: number = 64;
