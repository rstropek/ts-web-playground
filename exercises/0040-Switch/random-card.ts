let cardImage: p5.Image;

const BASE_URL = 'https://cddataexchange.blob.core.windows.net/images/cards';

function preload() {
  let color: string;
  const colorIx = Math.floor(random(0, 4));
  switch (colorIx)
  {
    case 0: color = 'clubs'; break;
    case 1: color = 'diamonds'; break;
    case 2: color = 'hearts'; break;
    default: color = 'spades'; break;
  }

  let card: string;
  const cardIx = Math.floor(random(1, 14));
  switch (cardIx)
  {
    case 1: card = 'A'; break;
    case 11: card = 'J'; break;
    case 12: card = 'Q'; break;
    case 13: card = 'K'; break;
    default: card = `${cardIx}`; break;
  }
  card = `${card}.png`;

  const url = `${BASE_URL}/${color}/${card}`;
  cardImage = loadImage(url);
}

function setup() {
  createCanvas(250, 250);
  background("darkgreen");

  imageMode(CENTER);
  image(cardImage, width / 2, height / 2);
}
