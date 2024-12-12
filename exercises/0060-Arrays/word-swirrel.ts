const WORDS = [
    "apple",
    "banana",
    "cherry",
    "orange",
    "grapes",
    "lemon",
    "melon",
    "peach",
    "plum",
    "berry",
    "water",
    "cloud",
    "bread",
    "cheese",
    "pizza",
    "table",
    "chair",
    "house",
    "grass",
    "flower"
  ];
  
  const WIDTH = 500;
  const HEIGHT = 500;
  const MARGIN = 75;
  
  let wordToGuess: string;
  
  function setup() {
    createCanvas(WIDTH, HEIGHT);
    background("black");
    textAlign(CENTER, CENTER);
    colorMode(HSB);
    angleMode(DEGREES);
  
    wordToGuess = random(WORDS);
  
    for(let i = 0; i < wordToGuess.length; i++) {
      const x = random(MARGIN, WIDTH - MARGIN);
      const y = random(MARGIN, HEIGHT - MARGIN);
      const charSize = random(50, 200);
      const textColor = random(0, 360);
      const angle = random (-90, 90);
  
      push();
      translate(x, y);
      rotate(angle);
      fill(textColor, 100, 100);
      textSize(charSize);
      text(wordToGuess[i], 0, 0);
      pop();
    }
  
    addForm();
  }
  
  function correct() {
    background("green");
  
    textSize(75);
    fill("black");
    text("Correct!", WIDTH / 2, HEIGHT / 2);
  }
  
  function wrong() {
    background("red");
  
    textSize(50);
    fill("white");
    text(`Wrong!\nIt was ${wordToGuess}`, WIDTH / 2, HEIGHT / 2);
  
  }
  
  function addForm() {
    const div = document.createElement("div");
    div.style.marginTop = "20px";
    div.style.fontFamily = "Arial";
  
    const label = document.createElement("div");
    label.innerText = "Welches Wort ist das?";
    div.appendChild(label);
  
    const input = document.createElement("input");
    input.type = "text";
    input.style.minWidth = "20rem";
    div.appendChild(input);
  
    const button = document.createElement("button");
    button.innerText = "Raten";
    button.style.marginLeft = "3px";
    button.addEventListener("click", () => {
      if (input.value === wordToGuess) {
        correct();
      } else {
        wrong();
      }
    });
    div.appendChild(button);
  
    document.body.append(div);
  }
  