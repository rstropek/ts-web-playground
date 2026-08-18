const CARD_WIDTH: number = 75;
const CARD_HEIGHT: number = 150;
const MARGIN: number = 4;

function shuffleCards(): string {
    const hand: string[] = getHand();

    hand.sort((a, b) => {
        const valueA: number = a[0] === '0' ? 10 : parseInt(a[0]);
        const valueB: number = b[0] === '0' ? 10 : parseInt(b[0]);
        return valueA - valueB;
    });
    return hand.join(',');
}

function drawHand(hand: string[]): void {
    push();
    for (const card of hand) {
        drawCard(card);
        translate(CARD_WIDTH + 10, 0);
    }
    pop();
}

function getHand(): string[] {
    // Suites heart (♥), diamond (♦), club (♣), spade (♠)
    const suites: string[] = ['H', 'D', 'C', 'S'];
    // To simplify, we only have card values 1..0 (0 = 10)
    const values: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

    const cards: string[] = [];
    for (const suite of suites) {
        for (const value of values) {
            const card: string = `${value}${suite}`;
            cards.push(card);
        }
    }

    // Shuffle the cards
    cards.sort(() => random() - 0.5);
    
    const hand: string[] = [];
    for (let i: number = 0; i < 5; i++) {
        hand.push(cards[i]);
    }

    return hand;
}

function drawCard(card: string): void {
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
    let value: string = card[0];
    if (value === '0') {
        value = '10';
    }
    text(value, 0, 0, CARD_WIDTH, CARD_HEIGHT);
    pop();
}
