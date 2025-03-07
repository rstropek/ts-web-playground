const CARD_WIDTH = 75;
const CARD_HEIGHT = 150;
const MARGIN = 4;

let hand: string[] = [];

function setup() {
    createCanvas(500, 500);

    // Here are example hands that you can use to test your program
    const royalFlush = "6H,7H,8H,9H,0H";
    const straightFlush = "5H,6H,7H,8H,9H";
    const fourOfAKind = "5H,5D,5C,5S,0H";
    const fullHouse = "5H,5D,5C,6H,6D";
    const flush = "2H,4H,6H,8H,0H";
    const straight = "5H,6S,7D,8C,9H";
    const threeOfAKind = "5H,5D,5C,6H,7D";
    const twoPairs = "5H,5D,6H,6S,7H";
    const pair = "5H,5D,6H,7D,8H";
    const highCard = "2H,3D,5S,7C,0H";
    const random = shuffleCards();
    
    // Test the program with the example hands
    //                 +---------- Change this line to test different hands
    //                 |           (e.g. royalFlush, straightFlush, fourOfAKind, ...)
    //                 v
    const handString = random;

    hand = splitCardsString(handString);
}

function mouseClicked() {
    hand = splitCardsString(shuffleCards());
}

function draw() {
    background(255);
    drawHand(hand);
    let message = "";
    const counts = getCounts(hand);
    if (isRoyalFlush(hand)) {
        message = "Royal Flush!";
    } else if (isStraightFlush(hand)) {
        message = "Straight Flush!";
    } else if (hasFourOfAKind(counts)) {
        message = "Four of a Kind!";
    } else if (isFullHouse(counts)) {
        message = "Full House!";
    } else if (isFlush(hand)) {
        message = "Flush!";
    } else if (isStraight(hand)) {
        message = "Straight!";
    } else if (hasThreeOfAKind(counts)) {
        message = "Three of a Kind!";
    } else if (hasTwoPairs(counts)) {
        message = "Two Pair!";
    } else if (hasPair(counts)) {
        message = "Pair!";
    } else {
        message = `Highest card:\n${getHighestCard(hand)}`;
    }
    push();
    fill("red");
    textSize(40);
    textAlign(CENTER, TOP);
    text(message, 0, CARD_HEIGHT + 30, CARD_WIDTH * 5 + 4 * 10, height - CARD_HEIGHT);
    pop();
}


function shuffleCards(): string {
    const hand = getHand();
  
    hand.sort((a, b) => {
        const valueA = a[0];
        const valueB = b[0];
        return valueA.localeCompare(valueB);
    });
    return hand.join(',');
}

function drawHand(hand: string[]) {
    push();
    for (const card of hand) {
        drawCard(card);
        translate(CARD_WIDTH + 10, 0);
    }
    pop();
}

function getHand(): string[] {
    // Suites heart (♥), diamond (♦), club (♣), spade (♠)
    const suites = ['H', 'D', 'C', 'S'];
    // To simplify, we only have card values 1..0 (0 = 10)
    const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

    const cards: string[] = [];
    for (const suite of suites) {
        for (const value of values) {
            const card = `${value}${suite}`;
            cards.push(card);
        }
    }

    // Shuffle the cards
    cards.sort(() => random() - 0.5);
    
    const hand: string[] = [];
    for (let i = 0; i < 5; i++) {
        hand.push(cards[i]);
    }

    return hand;
}

function drawCard(card: string) {
    push();
    fill("white");
    stroke("darkgray");
    strokeWeight(2);
    rect(0, 0, CARD_WIDTH, CARD_HEIGHT, 3);
    pop();

    push();
    if (card[1] === 'H' || card[1] === 'D') {
        fill("red");
    } else {
        fill("black");
    }
    textSize(25);
    let symbol: string;
    switch (card[1]) {
        case 'H':
            symbol = '♥';
            break;
        case 'D':
            symbol = '♦';
            break;
        case 'C':
            symbol = '♣';
            break;
        case 'S':
            symbol = '♠';
            break;
        default:
            throw new Error(`Unknown suite: ${card[1]}`);
    }
    textAlign(LEFT, TOP);
    text(symbol, MARGIN, MARGIN, CARD_WIDTH - MARGIN * 2, CARD_HEIGHT - MARGIN * 2);
    textAlign(RIGHT, TOP);
    text(symbol, MARGIN, MARGIN, CARD_WIDTH - MARGIN * 2, CARD_HEIGHT - MARGIN * 2);
    textAlign(LEFT, BOTTOM);
    text(symbol, MARGIN, MARGIN, CARD_WIDTH - MARGIN * 2, CARD_HEIGHT - MARGIN * 2);
    textAlign(RIGHT, BOTTOM);
    text(symbol, MARGIN, MARGIN, CARD_WIDTH - MARGIN * 2, CARD_HEIGHT - MARGIN * 2);

    textSize(50);
    textAlign(CENTER, CENTER);
    let value = card[0];
    if (value === '0') {
        value = '10';
    }
    text(value, 0, 0, CARD_WIDTH, CARD_HEIGHT);
    pop();
}

/**
 * Split a string with comma-separated cards into an array of cards
 * 
 * @param cards comma-separated cards (e.g. "5H,6H,7H,8H,9H")
 * @returns array of cards (e.g. ["5H", "6H", "7H", "8H", "9H"])
 * 
 * _cards_ is a string like "5H,6H,7H,8H,9H". The first character of
 * each card is the value (1..0, 0 stands for 10). The second character
 * is the suite (German: "Farbe") (H for hearts, D for diamonds, 
 * C for clubs, S for spades) (German: Herz, Karo, Pik, Kreuz).
 * 
 * The function splits the string into an array of cards.
 */
function splitCardsString(cards: string): string[] {
    const hand: string[] = [];
    let currentCard = '';
    for (const card of cards) {
        if (card === ',') {
            hand.push(currentCard);
            currentCard = '';
        } else {
            currentCard += card;
        }
    }
    hand.push(currentCard);
    return hand;
}

/**
 * Get the value of a card
 * 
 * @param card card (e.g. "5H")
 * @returns value of the card (e.g. 5)
 * 
 * Do NOT forget that 0 stands for 10. So the value 
 * of e.g. "0H" is 10, not 0!
 */
function getCardValue(card: string): number {
    let value = card[0];
    if (value === '0') {
        value = '10';
    }
    return parseInt(value);
}

/**
 * Get the description of a card
 * 
 * @param card card (e.g. "5H")
 * @returns description of the card (e.g. "5 of hearts")
 * 
 * The function returns the description of a card. The descriptions
 * for the suites are: "hearts" for "H", "spades" for "S",
 * "diamonds" for "D", and "clubs" for "C".
 * 
 * Tip: Consider using the function getCardValue() that you wrote
 * before to get the value of the card.
 */
function getCardDescription(card: string): string {
    const value = getCardValue(card);
    let suite: string;
    switch (card[1]) {
        case 'H':
            suite = 'hearts';
            break;
        case 'D':
            suite = 'diamonds';
            break;
        case 'C':
            suite = 'clubs';
            break;
        case 'S':
            suite = 'spades';
            break;
        default:
            throw new Error(`Unknown suite: ${card[1]}`);
    }
    return `${value} of ${suite}`;
}

/**
 * Gets the highest card in the hand
 * 
 * @param hand hand (e.g. ["5H", "6H", "7H", "8H", "9H"])
 * @returns highest card in the hand (e.g. "9H")
 * 
 * Tip: Consider using the function getCardValue() that you wrote
 * before to get the value of a card.
 */
function getHighestCard(hand: string[]): string {
    let highestCard = hand[0];
    let highestCardValue = getCardValue(hand[0]);
    for (let i = 1; i < hand.length; i++) {
        const cardValue = getCardValue(hand[i]);
        if (cardValue > highestCardValue) {
            highestCard = hand[i];
            highestCardValue = cardValue;
        }
    }
    return getCardDescription(highestCard);
}

/**
 * Get the counts of the cards in the hand
 * 
 * @param hand hand (e.g. ["5H", "6H", "7H", "8H", "9H"])
 * @returns Array with 10 elements, where the element at index i 
 * contains the number of cards with value i in the hand
 * 
 * Example: For the hand "5H,5S,7H,7D,8H" the function returns:
 * [0, 0, 0, 0, 0, 2, 0, 2, 1, 0].
 */
function getCounts(hand: string[]): number[] {
    const count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (const card of hand) {
        count[parseInt(card[0])]++;
    }

    return count;
}

/**
 * Checks if the hand is a flush
 * 
 * @param hand hand (e.g. ["5H", "6H", "7H", "8H", "9H"])
 * @returns true if the hand is a flush, false otherwise
 * 
 * A hand is a flush if all cards have the same suite.
 */
function isFlush(hand: string[]): boolean {
    const firstSuit = hand[0][1];
    for (let i = 1; i < hand.length; i++) {
        if (hand[i][1] !== firstSuit) {
            return false;
        }
    }

    return true;
}

/**
 * Checks if the hand is a straight
 * 
 * @param hand hand (e.g. ["5H", "6H", "7H", "8H", "9H"])
 * @returns true if the hand is a straight, false otherwise
 * 
 * A hand is a straight if the values of the cards are consecutive.
 * 
 * Tip: Consider using the function getCardValue() that you wrote
 * before to get the value of the card.
 */
function isStraight(hand: string[]): boolean {
    // Check if the values form a consecutive sequence
    // Convert string values to numbers (1-9 and 0 for 10)
    const values = [];
    for (const card of hand) {
        values.push(getCardValue(card));
    }

    // Check if values are consecutive
    for (let i = 1; i < values.length; i++) {
        if (values[i] !== values[i-1] + 1) {
            return false;
        }
    }

    return true;
}

/**
 * Checks if the hand is a straight flush
 * 
 * @param hand hand (e.g. ["5H", "6H", "7H", "8H", "9H"])
 * @returns true if the hand is a straight flush, false otherwise
 * 
 * A hand is a straight flush if it is a flush and a straight.
 */
function isStraightFlush(hand: string[]): boolean {
    if (!isFlush(hand)) {
        return false;
    }

    return isStraight(hand);
}

/**
 * Checks if the hand is a royal flush
 * 
 * @param hand hand (e.g. ["5H", "6H", "7H", "8H", "9H"])
 * @returns true if the hand is a royal flush, false otherwise
 * 
 * A hand is a royal flush if it is a straight flush
 * and the lowest card value is a 6.
 */
function isRoyalFlush(hand: string[]): boolean {
    return hand[0][0] === '6' && isStraightFlush(hand);
}

/**
 * Checks if the hand has four of a kind
 * 
 * @param counts counts (e.g. [0, 0, 0, 0, 0, 2, 0, 2, 1, 0])
 * @returns true if the hand has four of a kind, false otherwise
 */
function hasFourOfAKind(counts: number[]): boolean {
    for (const count of counts) {
        if (count === 4) {
            return true;
        }
    }
    return false;
}

/**
 * Checks if the hand has three of a kind
 * 
 * @param counts counts (e.g. [0, 0, 0, 0, 0, 2, 0, 2, 1, 0])
 * @returns true if the hand has three of a kind, false otherwise
 */
function hasThreeOfAKind(counts: number[]): boolean {
    for (const count of counts) {
        if (count === 3) {
            return true;
        }
    }
    return false;
}

/**
 * Gets the number of pairs in the hand
 * 
 * @param counts counts (e.g. [0, 0, 0, 0, 0, 2, 0, 2, 1, 0])
 * @returns number of pairs in the hand (e.g. 2)
 */
function numberOfPairs(counts: number[]): number {
    let pairs = 0;
    for (const count of counts) {
        if (count === 2) {
            pairs++;
        }
    }
    return pairs;
}

/**
 * Checks if the hand has two pairs
 * 
 * @param counts counts (e.g. [0, 0, 0, 0, 0, 2, 0, 2, 1, 0])
 * @returns true if the hand has two pairs, false otherwise
 */
function hasTwoPairs(counts: number[]): boolean {
    return numberOfPairs(counts) === 2;
}

/**
 * Checks if the hand has a pair
 * 
 * @param counts counts (e.g. [0, 0, 0, 0, 0, 2, 0, 2, 1, 0])
 * @returns true if the hand has a pair, false otherwise
 */
function hasPair(counts: number[]): boolean {
    return numberOfPairs(counts) === 1;
}

/**
 * Checks if the hand is a full house
 * 
 * @param counts counts (e.g. [0, 0, 0, 0, 0, 2, 0, 2, 1, 0])
 * @returns true if the hand is a full house, false otherwise
 * 
 * A hand is a full house if it has three of a kind and a pair.
 */
function isFullHouse(counts: number[]): boolean {
    return hasThreeOfAKind(counts) && hasPair(counts);
}
