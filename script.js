const board = document.querySelector('.board');
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.querySelector('.status');
const restartBtn = document.getElementById('restartBtn');
const truthDareModal = document.getElementById('truthDareModal');
const modalTitle = document.getElementById('modalTitle');
const modalQuestion = document.getElementById('modalQuestion');
const choiceButtons = document.getElementById('choiceButtons');
const resultSection = document.getElementById('resultSection');
const resultText = document.getElementById('resultText');
const restartAfterResultBtn = document.getElementById('restartAfterResult');
const closeModalBtn = document.querySelector('.close-button');

let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let winner = null;
let loserToAct = null;
const truthApiUrl = 'https://api.truthordarebot.xyz/v1/truth';
const dareApiUrl = 'https://api.truthordarebot.xyz/v1/dare';

// Function to fetch data from an API
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        displayModalError("Error fetching question.", "Please check your connection or try again later.");
        return null;
    }
}

// Function to display an error message in the modal
function displayModalError(title, message) {
    modalTitle.textContent = title;
    modalQuestion.textContent = message;
    choiceButtons.style.display = 'none';
    resultSection.style.display = 'block';
    truthDareModal.style.display = 'block';
}

// Function to fetch a truth from the API
async function fetchTruth() {
    const data = await fetchData(truthApiUrl);
    if (data && data.question) {
        showModal(`Truth for Player ${loserToAct}:`, data.question, false);
    } else {
        displayModalError("Error fetching truth.", "Please try again.");
    }
}

// Function to fetch a dare from the API
async function fetchDare() {
    const data = await fetchData(dareApiUrl);
    if (data && data.question) { // The API seems to use 'question' for dares too
        showModal(`Dare for Player ${loserToAct}:`, data.question, false);
    } else {
        displayModalError("Error fetching dare.", "Please try again.");
    }
}

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.dataset.index);

    if (gameBoard[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    gameBoard[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());

    const win = checkWin();
    if (win) {
        winner = currentPlayer;
        statusDisplay.textContent = `Player ${winner} wins!`;
        gameActive = false;
        setTimeout(() => showTruthDareModal(winner), 500);
    } else if (!gameBoard.includes('')) {
        statusDisplay.textContent = "It's a draw!";
        gameActive = false;
        setTimeout(() => showTruthDareModal(null), 500);
    } else {
        switchPlayer();
    }
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
}

function checkWin() {
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            return true;
        }
    }
    return false;
}

function showTruthDareModal(winningPlayer) {
    let loser = winningPlayer === 'X' ? 'O' : 'X';
    const modalTitleText = winningPlayer
        ? `Player ${winningPlayer} wins! Player ${loser}, pick Truth or Dare:`
        : `It's a draw! Player ${currentPlayer}, pick Truth or Dare:`; // Corrected loser for draw

    showModal(modalTitleText, "", true);
    winner = winningPlayer;
    loserToAct = loser;
}

function showModal(title, question, showChoices) {
    modalTitle.textContent = title;
    modalQuestion.textContent = question;
    choiceButtons.style.display = showChoices ? 'flex' : 'none';
    resultSection.style.display = showChoices ? 'none' : 'block';
    truthDareModal.style.display = 'block';
}

function handleTruthChoice() {
    fetchTruth();
}

function handleDareChoice() {
    fetchDare();
}

function closeModal() {
    truthDareModal.style.display = 'none';
    restartGame();
    winner = null;
    loserToAct = null;
}

function restartGame() {
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
    winner = null;
    loserToAct = null;
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);
document.getElementById('chooseTruth').addEventListener('click', handleTruthChoice);
document.getElementById('chooseDare').addEventListener('click', handleDareChoice);
restartAfterResultBtn.addEventListener('click', closeModal);
closeModalBtn.addEventListener('click', closeModal);

window.addEventListener('click', function(event) {
    if (event.target == truthDareModal) {
        closeModal();
    }
});