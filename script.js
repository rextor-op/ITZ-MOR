let currentPeriodIndex = 0;
let resultsPattern = []; // Initialize as empty array to hold AI-generated patterns
let history = []; // Track the historical results for Markov Chain (or other AI model)

const MARKOV_CHAIN_MODEL = {
    "BIG": { "BIG": 0.6, "SMALL": 0.4 }, // Probability to transition from BIG to BIG or SMALL
    "SMALL": { "BIG": 0.5, "SMALL": 0.5 } // Probability to transition from SMALL to BIG or SMALL
};

// Function to check if the network is online
function isOnline() {
    return navigator.onLine; // Checks if the browser is connected to the internet
}

// Function to simulate AI-based pattern generation using Markov Chain
function generateAIPattern() {
    const patternLength = 10;
    let newPattern = [];

    // Start with a random initial state
    let currentState = Math.random() > 0.5 ? "BIG" : "SMALL";

    // Generate the pattern based on the Markov Chain
    for (let i = 0; i < patternLength; i++) {
        newPattern.push(currentState);
        currentState = generateNextState(currentState);
    }

    return newPattern;
}

// Function to generate the next state using Markov Chain transition probabilities
function generateNextState(currentState) {
    const transitionProbabilities = MARKOV_CHAIN_MODEL[currentState];
    const randomValue = Math.random();
    let cumulativeProbability = 0;

    for (let nextState in transitionProbabilities) {
        cumulativeProbability += transitionProbabilities[nextState];
        if (randomValue < cumulativeProbability) {
            return nextState;
        }
    }

    return currentState; // Fallback (shouldn't hit this point if probabilities sum to 1)
}

// Function to update the historical results
function updateHistory(result) {
    history.push(result);
    if (history.length > 100) {
        history.shift(); // Keep history limited to the last 100 results
    }
}

// Function to check if AI can predict next result based on history (for more complex AI models)
function predictNextAI() {
    if (history.length === 0) return "BIG"; // Default prediction if no history available

    const lastResult = history[history.length - 1];
    return generateNextState(lastResult); // Predict next result based on Markov Chain
}

// Function to update period and timer
function updatePeriodAndTimer() {
    const now = new Date();
    const seconds = now.getUTCSeconds();
    const remainingSeconds = 60 - seconds;
    const minutes = now.getUTCMinutes();
    const totalMinutes = now.getUTCHours() * 60 + minutes;

    // Update period number
    const periodNumber = generatePeriodNumber(now, totalMinutes);
    document.getElementById("period1m").textContent = periodNumber;

    // Update timer
    document.getElementById("timer1m").textContent = formatTime(remainingSeconds);

    // Show result when period changes
    if (remainingSeconds === 60) {
        // Only generate new patterns when network is online
        if (isOnline()) {
            resultsPattern = generateAIPattern(); // Generate new AI-based pattern when online
        }
        displayResult(periodNumber);
    }
}

function generatePeriodNumber(now, totalMinutes) {
    return `${now.getUTCFullYear()}${(now.getUTCMonth() + 1).toString().padStart(2, "0")}${now.getUTCDate().toString().padStart(2, "0")}1000${(10001 + totalMinutes).toString()}`;
}

function formatTime(remainingSeconds) {
    return `00:${remainingSeconds.toString().padStart(2, "0")}`;
}

function displayResult(periodNumber) {
    const resultDisplay = document.getElementById("resultDisplay");

    // Check if AI-generated results are available, if not, display a default message
    if (resultsPattern.length === 0) {
        resultDisplay.textContent = "Waiting for network...";
        resultDisplay.className = "result waiting";
        return;
    }

    // Update current result based on AI-generated pattern or prediction
    const currentResult = resultsPattern[currentPeriodIndex] || predictNextAI(); // Fallback to AI prediction if no pattern

    // Update the result display
    resultDisplay.textContent = currentResult;

    // Add class for styling
    resultDisplay.className = `result ${currentResult.toLowerCase()}`;

    // Update history for future predictions
    updateHistory(currentResult);

    currentPeriodIndex = (currentPeriodIndex + 1) % resultsPattern.length;
}

// Initialize the timer update
setInterval(updatePeriodAndTimer, 1000);