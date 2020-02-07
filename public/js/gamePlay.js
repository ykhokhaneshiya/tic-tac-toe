import { timer, clearTimer } from './timer.js';

const socket = io();

const name = sessionStorage.name;
const matrixSize = sessionStorage.matrixSize;
const winCount = sessionStorage.winCount;

const gameBoard = new Array(matrixSize);
const gameBoardBtnsArray = new Array(matrixSize);

for (let i = 0; i < matrixSize; i++) {
	gameBoard[i] = new Array(matrixSize);
	gameBoardBtnsArray[i] = new Array(matrixSize);
}

document.title = 'Welcome! ' + name;

const status = document.getElementById('status');
const matrixSizeElem = document.getElementsByClassName('matrixSize')[0];
const winCountElem = document.getElementsByClassName('winCount')[0];
const playerLabel = document.getElementsByClassName('playerLabel')[0];
const systemLabel = document.getElementsByClassName('systemLabel')[0];
const gameBoardElem = document.getElementById('gameBoard');
const startGame = document.getElementById('startGame');

playerLabel.innerHTML = name;
matrixSizeElem.innerHTML = '<b>Matrix Size: ' + matrixSize + '</b>';
winCountElem.innerHTML = '<b>Win Count: ' + winCount + '</b>';

let isMyTurn = false;

for (let i = 0; i < matrixSize; i++) {
	for (let j = 0; j < matrixSize; j++) {
		const elem = document.createElement('li');
		elem.className = 'tic';
		elem.setAttribute('id', `btn_${i}_${j}`);

		elem.addEventListener('click', handleBtnClick);

		gameBoardBtnsArray[i][j] = elem;

		gameBoardElem.append(elem);
	}
	const clearFixElem = document.createElement('li');
	clearFixElem.className = 'clearfix';
	gameBoardElem.append(clearFixElem);
}

startGame.addEventListener('click', function() {
	initGame();
	this.style.display = 'none';
	socket.emit('startGame');
	status.style.display = 'block';
});

//socket events
socket.emit('newUserEntered', { name, matrixSize, winCount });

socket.on('turnChange', function({ sign, data }) {
	if (status.style.display === 'block') status.style.display = 'none';

	if (data) {
		gameBoardBtnsArray[data.pos.i][data.pos.j].textContent = data.sign;
		gameBoard[data.pos.i][data.pos.j] = data.sign;
	}

	if (sign === 'X') {
		isMyTurn = true;
		systemLabel.className = 'systemLabel';
		playerLabel.className += ' active';
	} else if (sign === 'O') {
		isMyTurn = false;
		playerLabel.className = 'playerLabel';
		systemLabel.className += ' active';
	}

	clearTimer();
	timer(10);
});

socket.on('gameOver', function({ data: result }) {
	startGame.style.display = 'inline-block';
	isMyTurn = false;
	systemLabel.className = 'systemLabel';
	playerLabel.className = 'playerLabel';
	clearTimer();

	if (result !== 'tie') {
		status.textContent = `Player ${result} won!`;
	} else {
		status.textContent = `Game draw!`;
	}
	status.style.display = 'block';
});

function handleBtnClick(e) {
	const btn = e.currentTarget;
	const [ btnText, i, j ] = btn.getAttribute('id').split('_');
	if (isMyTurn && gameBoard[i][j] === '') {
		isMyTurn = false;

		gameBoard[i][j] = 'X';
		//printGameBoard();

		btn.textContent = 'X';

		clearTimer();

		socket.emit('playerTurnCompleted', { i, j });
	}
}

function printGameBoard() {
	console.log(gameBoard);
}

function initGame() {
	for (let i = 0; i < matrixSize; i++) {
		for (let j = 0; j < matrixSize; j++) {
			gameBoard[i][j] = '';
		}
	}
	document.querySelectorAll('.tic').forEach((element) => {
		element.textContent = '';
	});
}
