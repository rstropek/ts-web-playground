let img: any;
const tiles = 3;

const tileIndexes: string[][] = [];

function preload() {
  img = loadImage('https://cddataexchange.blob.core.windows.net/data-exchange/bunny.png');
}

function setup() {
  createCanvas(500, 500);

  for (let y = 0; y < tiles; y++) {
    const line: string[] = [];
    for (let x = 0; x < tiles; x++) {
      if (x !== tiles - 1 || y !== tiles - 1) {
        line.push(`${x}-${y}`);
      } else {
        line.push('');
      }
    }

    tileIndexes.push(line);
  }

  // Shuffle the tile indexes by making multiple random moves
  const shuffleMoves = 1; // Number of random moves to make
  for (let i = 0; i < shuffleMoves; i++) {
    const emptyTile = findEmptyTile();
    const emptyXY = emptyTile.split('-');
    const emptyX = parseInt(emptyXY[0]);
    const emptyY = parseInt(emptyXY[1]);

    const randomTile = getRandomTileNextTo(emptyTile);
    const randomXY = randomTile.split('-');
    const randomX = parseInt(randomXY[0]);
    const randomY = parseInt(randomXY[1]);

    // Swap the tiles
    tileIndexes[emptyY][emptyX] = tileIndexes[randomY][randomX];
    tileIndexes[randomY][randomX] = '';
  }
}

function findEmptyTile(): string {
  for (let y = 0; y < tiles; y++) {
    for (let x = 0; x < tiles; x++) {
      if (!tileIndexes[y][x]) {
        return `${x}-${y}`;
      }
    }
  }

  return '';
}

function getRandomTileNextTo(tileIndex: string): string {
  const xy = tileIndex.split('-');
  const x = parseInt(xy[0]);
  const y = parseInt(xy[1]);

  // Create array of valid directions
  const validDirections = [];
  if (y > 0) validDirections.push('up');
  if (y < tiles - 1) validDirections.push('down');
  if (x > 0) validDirections.push('left');
  if (x < tiles - 1) validDirections.push('right');

  // Select a random valid direction
  const direction = random(validDirections);

  // Return the tile in the selected direction
  if (direction === 'up') return `${x}-${y - 1}`;
  if (direction === 'down') return `${x}-${y + 1}`;
  if (direction === 'left') return `${x - 1}-${y}`;
  if (direction === 'right') return `${x + 1}-${y}`;

  return ''; // This should never happen as we only select valid directions
}

function isNeighbor(tile1: string, tile2: string): boolean {
  const xy1 = tile1.split('-');
  const xy2 = tile2.split('-');
  const x1 = parseInt(xy1[0]);
  const y1 = parseInt(xy1[1]);
  const x2 = parseInt(xy2[0]);
  const y2 = parseInt(xy2[1]);

  return (Math.abs(x1 - x2) === 1 && y1 === y2) || (Math.abs(y1 - y2) === 1 && x1 === x2);
}

function draw() {
  background("white");
  stroke('white');
  strokeWeight(2);
  noFill();

  const tileSize = img.width / tiles;
  for (let y = 0; y < tiles; y++) {
    for (let x = 0; x < tiles; x++) {
      const tileIndex = tileIndexes[y][x];
      if (tileIndex) {
        const xy = tileIndex.split('-');
        const xIndex = parseInt(xy[0]);
        const yIndex = parseInt(xy[1]);
        image(img, x * tileSize, y * tileSize, tileSize, tileSize, xIndex * tileSize, yIndex * tileSize, tileSize, tileSize);
      }

      rect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

function mousePressed() {
  const clickedTileX = floor(mouseX / (img.width / tiles));
  const clickedTileY = floor(mouseY / (img.width / tiles));

  const emptyTile = findEmptyTile();
  const emptyXY = emptyTile.split('-');
  const emptyX = parseInt(emptyXY[0]);
  const emptyY = parseInt(emptyXY[1]);

  if (isNeighbor(`${clickedTileX}-${clickedTileY}`, emptyTile)) {
    tileIndexes[emptyY][emptyX] = tileIndexes[clickedTileY][clickedTileX];
    tileIndexes[clickedTileY][clickedTileX] = "";
  }
}
