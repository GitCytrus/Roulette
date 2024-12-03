let shotsFired = 0; // Liczba strzałów wykonanych w grze
let currentPlayer = 1; // 1: Ty, 2: Bot
const history = document.getElementById("history");
const shootButton = document.getElementById("shoot");
const passButton = document.getElementById("pass");
const startButton = document.getElementById("start-game");
const player1Name = document.getElementById("player1-name");
const player2Name = document.getElementById("player2-name");

// Dodaj tekst do historii
function addToHistory(message, className) {
    const event = document.createElement("p");
    event.textContent = message;
    event.className = className;
    history.prepend(event);
}

// Podświetl aktywnego gracza
function highlightPlayer() {
    player1Name.classList.remove("highlight");
    player2Name.classList.remove("highlight");

    if (currentPlayer === 1) {
        player1Name.classList.add("highlight");
    } else {
        player2Name.classList.add("highlight");
    }
}

// Losowanie startowego gracza
function determineStartingPlayer() {
    const second = new Date().getSeconds();
    return Math.floor(second / 3.033) % 2 === 0 ? 1 : 2;
}

// Przełączanie gracza
function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    highlightPlayer();
    if (currentPlayer === 2) {
        botTurn();
    } else {
        shootButton.style.display = "block";
        passButton.style.display = "none";
    }
}

// Oblicz szansę na śmierć (zwiększa się z każdym strzałem) — dla gracza i bota
function calculateDeathChance(shots) {
    const chances = [0, 10, 15, 30, 45, 70, 100]; // Prawdopodobieństwa na śmierć dla 1-7 strzałów
    return chances[shots - 1] / 100; // Dzielimy przez 100, bo procenty muszą być w skali od 0 do 1
}

// Rzut na śmierć
function didDie(shots) {
    const chance = calculateDeathChance(shots);
    return Math.random() < chance;
}

// Strzał gracza
function shoot() {
    shotsFired++;
    if (didDie(shotsFired)) {
        addToHistory(currentPlayer === 1 ? "You didn't survive the shot!" : "Opponent didn't survive the shot!", "special");
        addToHistory(currentPlayer === 1 ? "You lost!" : "You won!", "special");
        resetGame();
    } else {
        addToHistory(currentPlayer === 1 ? "You survived the shot!" : "Opponent survived the shot!", currentPlayer === 1 ? "player" : "opponent");
        passButton.style.display = "block";
    }
}

// Tura bota (losowa liczba strzałów z ryzykiem)
async function botTurn() {
    shootButton.style.display = "none"; // Ukryj przycisk gracza
    passButton.style.display = "none";
    
    let botShots = 0;
    const chance = Math.random(); // Losowanie prawdopodobieństwa strzałów

    if (chance < 0.5) {
        botShots = 1; // 50% szans na 1 strzał
    } else if (chance < 0.83) {
        botShots = 2; // 33% szans na 2 strzały
    } else {
        botShots = 3; // 17% szans na 3 strzały
    }

    for (let i = 0; i < botShots; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Cooldown między strzałami
        shotsFired++;
        addToHistory("Opponent took a shot.", "opponent");

        if (didDie(shotsFired)) {
            addToHistory("Opponent didn't survive the shot!", "special");
            addToHistory("You won!", "special");
            resetGame();
            return;
        }
    }

    addToHistory("Opponent passed the gun to you.", "opponent");
    switchPlayer();
}

// Resetowanie gry
function resetGame() {
    shotsFired = 0;
    shootButton.style.display = "none";
    passButton.style.display = "none";
    startButton.style.display = "block";
}

// Przyciski akcji
shootButton.onclick = shoot;
passButton.onclick = () => {
    addToHistory("You passed the gun to your opponent.", "player");
    shootButton.style.display = "none";
    passButton.style.display = "none";
    switchPlayer();
};

// Rozpocznij grę
startButton.onclick = () => {
    shotsFired = 0;
    currentPlayer = determineStartingPlayer();
    highlightPlayer();
    startButton.style.display = "none";
    shootButton.style.display = currentPlayer === 1 ? "block" : "none";
    if (currentPlayer === 1) {
        addToHistory("You start the game!", "special");
    } else {
        addToHistory("Opponent starts the game!", "special");
        botTurn();
    }
};

// Wyczyszczenie historii
document.getElementById("clear-history").onclick = () => {
    history.innerHTML = "";
    addToHistory("History cleared!", "special");
};
