function setup() {
    createCanvas(500, 500);
    background("white");

    let result = "";
    let sum = getSum("1,2,30,4,5");
    result += `getSum 1: ${sum} ${sum === 42 ? "✅" : "❌"}\n`;

    sum = getSum("");
    result += `getSum 2: ${sum} ${sum === 0 ? "✅" : "❌"}\n`;

    let index = getIndexOf("1,2,30,4,5", 30);
    result += `getIndexOf 1: ${index} ${index === 4 ? "✅" : "❌"}\n`;

    index = getIndexOf("1,2,30,4,5", 31);
    result += `getIndexOf 2: ${index} ${index === -1 ? "✅" : "❌"}\n`;

    let array = [1, 2, 30, 4, 5];
    index = findIndexInArray(array, 30);
    result += `findIndexInArray 1: ${index} ${index === 2 ? "✅" : "❌"}\n`;

    index = findIndexInArray(array, 31);
    result += `findIndexInArray 2: ${index} ${index === -1 ? "✅" : "❌"}\n`;

    let cardShortcode = "S5";
    let decoded = decodeCCard(cardShortcode);
    result += `decodeCCard 1: ${decoded} ${decoded === "5 of Spades" ? "✅" : "❌"}\n`;

    cardShortcode = "HJ";
    decoded = decodeCCard(cardShortcode);
    result += `decodeCCard 2: ${decoded} ${decoded === "Jack of Hearts" ? "✅" : "❌"}\n`;

    let evenNumbers = findAllEvenNumbers("1,2,30,4,5");
    result += `findAllEvenNumbers 1: ${evenNumbers} ${evenNumbers.indexOf(2) !== -1 && evenNumbers.indexOf(30) !== -1 && evenNumbers.indexOf(4) !== -1 ? "✅" : "❌"}\n`;

    evenNumbers = findAllEvenNumbers("1,3,5,7,9");
    result += `findAllEvenNumbers 2: ${evenNumbers} ${evenNumbers.length === 0 ? "✅" : "❌"}\n`;

    evenNumbers = findAllEvenNumbers("");
    result += `findAllEvenNumbers 3: ${evenNumbers} ${evenNumbers.length === 0 ? "✅" : "❌"}\n`;

    fill("black");
    textAlign(LEFT, TOP);
    textSize(15);
    text(result, 10, 10, width - 20, height - 20);
}

/**
 * Parse a string of numbers separated by commas and return the sum of the numbers
 * @param numbersString - A string of numbers separated by commas (e.g. "1,2,30,4,5")
 * @returns The sum of the numbers, 0 if the string is empty
 */
function getSum(numbersString: string): number {
    let sum = 0;
    let currentNumber = "";
    for (let i = 0; i < numbersString.length; i++) {
        if (numbersString[i] === ",") {
            sum += parseInt(currentNumber);
            currentNumber = "";
        } else {
            currentNumber += numbersString[i];
        }
    }
    if (currentNumber) {
        sum += parseInt(currentNumber);
    }
    return sum;
}

/**
 * Get the start index of a number in a string of numbers separated by commas
 * @param numbersString - A string of numbers separated by commas (e.g. "1,2,30,4,5")
 * @param number - The number to get the index of (e.g. 30)
 * @returns The start index of the number, -1 if the number is not found
 */
function getIndexOf(numbersString: string, number: number): number {
    let currentNumber = "";
    let startIndex = 0;
    
    for (let i = 0; i < numbersString.length; i++) {
        if (numbersString[i] === ",") {
            if (parseInt(currentNumber) === number) {
                return startIndex;
            }
            currentNumber = "";
            startIndex = i + 1;
        } else {
            currentNumber += numbersString[i];
        }
    }
    
    // Check the last number after the loop ends
    if (parseInt(currentNumber) === number) {
        return startIndex;
    }
    
    // Return -1 if the number is not found
    return -1;
}

/**
 * Find the index of a number in an array
 * @param array - An array of numbers (e.g. [1, 2, 30, 4, 5])
 * @param number - The number to find the index of (e.g. 30)
 * @returns The index of the number, -1 if the number is not found
 */
function findIndexInArray(array: number[], number: number): number {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === number) {
            return i;
        }
    }
    return -1;
}

/**
 * Decode a playing card shortcode
 * @param cardShortcode - A shortcode for a playing card (e.g. "S5", "HJ", "DQ", "C8")
 * @returns The decoded playing card (e.g. "5 of Spades", "Jack of Hearts", "Queen of Diamonds", "8 of Clubs")
 * 
 * Shortcodes consist of the suite (first character) and the rank (second character).
 * 
 * Suites:
 * * S: Spades (♠)
 * * H: Hearts (♥)
 * * D: Diamonds (♦)
 * * C: Clubs (♣)
 * 
 * Ranks:
 * * 2-9: The number
 * * T: 10
 * * J: Jack
 * * Q: Queen
 * * K: King
 * * A: Ace
 */
function decodeCCard(cardShortcode: string): string {
    const suite = cardShortcode[0];
    const rank = cardShortcode[1];

    // Decode suite
    let suiteName: string;
    switch (suite) {
        case 'S':
            suiteName = "Spades";
            break;
        case 'H':
            suiteName = "Hearts";
            break;
        case 'D':
            suiteName = "Diamonds";
            break;
        case 'C':
            suiteName = "Clubs";
            break;
        default:
            // Just in case
            suiteName = "Unknown";
    }

    // Decode rank
    let rankName: string;
    switch (rank) {
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            rankName = rank;
            break;
        case 'T':
            rankName = "10";
            break;
        case 'J':
            rankName = "Jack";
            break;
        case 'Q':
            rankName = "Queen";
            break;
        case 'K':
            rankName = "King";
            break;
        case 'A':
            rankName = "Ace";
            break;
        default:
            // Just in case
            rankName = "Unknown";
    }

    return `${rankName} of ${suiteName}`;
}

/**
 * Find all even numbers in a string of numbers separated by commas
 * @param numberString - A string of numbers separated by commas (e.g. "1,2,30,4,5")
 * @returns An array of even numbers (e.g. [2, 30, 4]), empty array if no even numbers are found
 */
function findAllEvenNumbers(numberString: string): number[] {
    const evenNumbers: number[] = [];
    let currentNumber = "";
    
    for (let i = 0; i < numberString.length; i++) {
        if (numberString[i] === ",") {
            const num = parseInt(currentNumber);
            if (num % 2 === 0) {
                evenNumbers.push(num);
            }
            currentNumber = "";
        } else {
            currentNumber += numberString[i];
        }
    }
    
    // Check the last number after the loop
    if (currentNumber) {
        const num = parseInt(currentNumber);
        if (num % 2 === 0) {
            evenNumbers.push(num);
        }
    }
    
    return evenNumbers;
}
