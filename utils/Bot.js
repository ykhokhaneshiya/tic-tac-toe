const schedule = require('node-schedule');
const _ = require('lodash');

class Bot {
	constructor(opponentName, opponentSocket, matrixSize, winCount) {
		this.opponentName = opponentName;
		this.opponentSocket = opponentSocket;
		this.matrixSize = parseInt(matrixSize);
		this.winCount = parseInt(winCount);
		this.currentTurn = 'X';
		this.botSign = 'O';
		this.opponentSign = 'X';
		this.totalMoves = 0;
		this.playerMoves = 0;
		this.botMoves = 0;
		this.scores = { [this.opponentSign]: -1, [this.botSign]: 1, tie: 0 };
		this.timer;
		this.playerConsideredMoves = [];

		//board initialization
		this.initBoard();

		//events initialization
		this.initEvents();
	}

	initBoard() {
		this.gameBoard = new Array(this.matrix);
		for (let i = 0; i < this.matrixSize; i++) {
			this.gameBoard[i] = new Array(this.matrixSize);
		}

		for (let i = 0; i < this.matrixSize; i++) {
			for (let j = 0; j < this.matrixSize; j++) {
				this.gameBoard[i][j] = '';
			}
		}
	}

	initEvents() {
		this.opponentSocket.on('startGame', () => {
			this.startPlaying();
		});

		this.opponentSocket.on('disconnect', () => {
			if (this.timer) this.timer.cancel();
		});
	}

	startPlaying() {
		this.changeTurn();

		this.opponentSocket.on('playerTurnCompleted', ({ i, j }) => {
			this.timer.cancel();

			this.gameBoard[i][j] = this.opponentSign;
			this.lastPlayerMove = { i, j };
			this.playerMoves++;
			this.totalMoves++;

			this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';

			this.changeTurn();
		});
	}

	changeTurn(data) {
		if (this.timer) this.timer.cancel();

		this.opponentSocket.emit('turnChange', { sign: this.currentTurn, data });

		const result = this.checkForGameTermination();
		if (result) {
			this.totalMoves = 0;
			this.playerMoves = 0;
			this.botMoves = 0;
			this.currentTurn = 'X';
			this.initBoard();
			this.timer.cancel();
			this.opponentSocket.emit('gameOver', { data: result });
			return;
		}

		let futureTime = 0;
		if (this.currentTurn === this.opponentSign) {
			futureTime = new Date(new Date().getTime() + 11000);
		} else if (this.currentTurn === this.botSign) {
			futureTime = new Date(new Date().getTime() + 1000);
		}

		this.timer = schedule.scheduleJob(futureTime, () => {
			let index;
			if (this.currentTurn === this.opponentSign) {
				this.playerMoves++;
				index = this.getFirstAvailableIndex();
				this.lastPlayerMove = index;
				this.gameBoard[index.i][index.j] = this.currentTurn;
			} else if (this.currentTurn === this.botSign) {
				index = this.getBestMove();
				this.gameBoard[index.i][index.j] = this.botSign;
				this.botMoves++;
			}

			this.totalMoves++;

			this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';
			this.changeTurn({ sign: this.currentTurn === 'X' ? 'O' : 'X', pos: index });
		});
	}

	getBestMove() {
		//for 3*3 matrix only
		if (this.matrixSize === 3) {
			let bestScore = -Infinity;
			let move;
			for (let i = 0; i < this.matrixSize; i++) {
				for (let j = 0; j < this.matrixSize; j++) {
					if (this.gameBoard[i][j] === '') {
						this.gameBoard[i][j] = this.botSign;
						let score = this.minimax(0, false, -Infinity, +Infinity);
						this.gameBoard[i][j] = '';

						if (score > bestScore) {
							bestScore = score;
							move = { i, j };
						}
					}
				}
			}
			return move;
		} else {
			return this.getCustomMove();
		}
	}

	checkForGameTermination() {
		let result = this.checkForWin('X');
		if (result) return result;

		result = this.checkForWin('O');
		if (result) return result;

		let openSpots = 0;
		for (let i = 0; i < this.matrixSize; i++) {
			for (let j = 0; j < this.matrixSize; j++) {
				if (this.gameBoard[i][j] === '') {
					openSpots++;
				}
			}
		}

		if (openSpots === 0) return 'tie';

		return false;
	}

	checkForWin(checkForWinSymbol) {
		let currentCount = 0;
		let isStarted = false;
		const matrixSize = this.matrixSize;
		const gameBoard = this.gameBoard;

		for (let i = 0; i < matrixSize; i++) {
			currentCount = 0;
			isStarted = false;

			for (let j = 0; j < matrixSize; j++) {
				if (gameBoard[i][j] == checkForWinSymbol && currentCount < this.winCount) {
					isStarted = true;
					currentCount++;
				} else if (isStarted) {
					isStarted = false;
					if (currentCount !== this.winCount) currentCount = 0;
				}
			}

			if (currentCount === this.winCount) {
				return checkForWinSymbol;
			}
		}

		for (let i = 0; i < matrixSize; i++) {
			currentCount = 0;
			isStarted = false;

			for (let j = 0; j < matrixSize; j++) {
				if (gameBoard[j][i] == checkForWinSymbol && currentCount < this.winCount) {
					isStarted = true;
					currentCount++;
				} else if (isStarted) {
					isStarted = false;
					if (currentCount !== this.winCount) currentCount = 0;
				}
			}

			if (currentCount === this.winCount) {
				return checkForWinSymbol;
			}
		}

		for (let k = 0; k <= 2 * matrixSize; ++k) {
			currentCount = 0;
			isStarted = false;

			for (let y = matrixSize - 1; y >= 0; --y) {
				let x = k - y;
				if (x >= 0 && x < matrixSize) {
					if (gameBoard[y][x] == checkForWinSymbol && currentCount < this.winCount) {
						isStarted = true;
						currentCount++;
					} else if (isStarted) {
						isStarted = false;
						if (currentCount !== this.winCount) currentCount = 0;
					}
				}
			}

			if (currentCount === this.winCount) {
				return checkForWinSymbol;
			}
		}

		for (let k = 0; k <= 2 * matrixSize; ++k) {
			currentCount = 0;
			isStarted = false;

			for (let y = 0; y < matrixSize; y++) {
				let x = k - (matrixSize - y);
				if (x >= 0 && x < matrixSize) {
					if (gameBoard[x][y] == checkForWinSymbol && currentCount < this.winCount) {
						isStarted = true;
						currentCount++;
					} else if (isStarted) {
						isStarted = false;
						if (currentCount !== this.winCount) currentCount = 0;
					}
				}
			}

			if (currentCount === this.winCount) {
				return checkForWinSymbol;
			}
		}

		return false;
	}

	checkForSeq(symbol, count) {
		let currentCount = 0;
		let isStarted = false;
		const matrixSize = this.matrixSize;
		const gameBoard = this.gameBoard;

		let tempArr = [];

		//horizontal
		for (let i = 0; i < matrixSize; i++) {
			currentCount = 0;
			isStarted = false;

			for (let j = 0; j < matrixSize; j++) {
				if (gameBoard[i][j] === symbol && currentCount < count) {
					isStarted = true;
					tempArr.push({ i, j });
					currentCount++;
				} else if (isStarted) {
					isStarted = false;
					if (tempArr.length !== count) {
						tempArr = [];
						currentCount = 0;
					}
				}
			}

			if (currentCount === count) {
				let isFound = false;
				for (let i = 0; i < this.playerConsideredMoves.length; i++) {
					const val = this.playerConsideredMoves[i];
					if (_.isEqual(val, { h: tempArr })) {
						isFound = true;
						break;
					}
				}
				if (!isFound) {
					this.playerConsideredMoves.push({ h: tempArr });
					return { h: tempArr };
				}
			} else {
				tempArr = [];
			}
		}

		tempArr = [];

		//vertical
		for (let i = 0; i < matrixSize; i++) {
			currentCount = 0;
			isStarted = false;

			for (let j = 0; j < matrixSize; j++) {
				if (gameBoard[j][i] == symbol && currentCount <= count) {
					isStarted = true;
					tempArr.push({ i: j, j: i });
					currentCount++;
				} else if (isStarted) {
					isStarted = false;
					if (tempArr.length !== count) {
						tempArr = [];
						currentCount = 0;
					}
				}
			}

			if (currentCount === count) {
				let isFound = false;
				for (let i = 0; i < this.playerConsideredMoves.length; i++) {
					const val = this.playerConsideredMoves[i];
					if (_.isEqual(val, { v: tempArr })) {
						isFound = true;
						break;
					}
				}
				if (!isFound) {
					this.playerConsideredMoves.push({ v: tempArr });
					return { v: tempArr };
				}
			} else {
				tempArr = [];
			}
		}

		tempArr = [];

		//d1
		for (let k = 0; k <= 2 * matrixSize; ++k) {
			currentCount = 0;
			isStarted = false;

			for (let y = matrixSize - 1; y >= 0; --y) {
				let x = k - y;
				if (x >= 0 && x < matrixSize) {
					if (gameBoard[y][x] == symbol && currentCount < count) {
						isStarted = true;
						tempArr.push({ i: y, j: x });
						currentCount++;
					} else if (isStarted) {
						isStarted = false;
						if (tempArr.length !== count) {
							tempArr = [];
							currentCount = 0;
						}
					}
				}

				if (currentCount === count) {
					let isFound = false;
					for (let i = 0; i < this.playerConsideredMoves.length; i++) {
						const val = this.playerConsideredMoves[i];
						if (_.isEqual(val, { d1: tempArr })) {
							isFound = true;
							break;
						}
					}
					if (!isFound) {
						this.playerConsideredMoves.push({ d1: tempArr });
						return { d1: tempArr };
					} else {
						currentCount = 0;
					}
				}
			}
		}

		tempArr = [];

		//d2
		for (let k = 0; k <= 2 * matrixSize; ++k) {
			currentCount = 0;
			isStarted = false;

			for (let y = 0; y < matrixSize; y++) {
				let x = k - (matrixSize - y);
				if (x >= 0 && x < matrixSize) {
					if (gameBoard[x][y] == symbol && currentCount <= count) {
						isStarted = true;
						tempArr.push({ i: x, j: y });
						currentCount++;
					} else if (isStarted) {
						isStarted = false;
						if (tempArr.length !== count) {
							tempArr = [];
							currentCount = 0;
						}
					}
				}
			}

			if (currentCount === count) {
				let isFound = false;
				for (let i = 0; i < this.playerConsideredMoves.length; i++) {
					const val = this.playerConsideredMoves[i];
					if (_.isEqual(val, { d2: tempArr })) {
						isFound = true;
						break;
					}
				}
				if (!isFound) {
					this.playerConsideredMoves.push({ d2: tempArr });
					return { d2: tempArr };
				}
			} else {
				tempArr = [];
			}
		}

		return false;
	}

	getFirstAvailableIndex() {
		for (let i = 0; i < this.matrixSize; i++) {
			for (let j = 0; j < this.matrixSize; j++) {
				if (this.gameBoard[i][j] === '') return { i, j };
			}
		}
	}

	getCustomMove() {
		let result;

		for (let i = 1; i < this.winCount; i++) {
			if (i === 1) {
				if ((result = this.checkForSeq(this.botSign, this.winCount - i))) {
					const res = this.getBotIndex(result);
					if (res) return res;
				}
				if ((result = this.checkForSeq(this.opponentSign, this.winCount - i))) {
					const res = this.getBotIndex(result);
					if (res) return res;
				}
			} else if (i <= Math.ceil(this.winCount / 2) && this.matrixSize !== this.winCount) {
				if ((result = this.checkForSeq(this.opponentSign, this.winCount - i))) {
					const res = this.getBotIndex(result);
					if (res) return res;
				}
				if ((result = this.checkForSeq(this.botSign, this.winCount - i))) {
					const res = this.getBotIndex(result);
					if (res) return res;
				}
			} else {
				if ((result = this.checkForSeq(this.botSign, this.winCount - i))) {
					const res = this.getBotIndex(result);
					if (res) return res;
				}
			}
		}

		//four corners
		let fourCorners = [
			{ i: 0, j: 0 },
			{ i: 0, j: this.matrixSize - 1 },
			{ i: this.matrixSize - 1, j: 0 },
			{ i: this.matrixSize - 1, j: this.matrixSize - 1 }
		];

		this.shuffle(fourCorners);

		for (let i = 0; i < fourCorners.length; i++) {
			const { i: iBoard, j: jBoard } = fourCorners[i];
			if (this.gameBoard[iBoard][jBoard] === '') return fourCorners[i];
		}

		return this.getFirstAvailableIndex();
	}

	getBotIndex(result) {
		let prevIndex, afterIndex;
		let direction;
		if (result.h) {
			prevIndex = { i: result.h[0].i, j: result.h[0].j - 1 };
			afterIndex = {
				i: result.h[result.h.length - 1].i,
				j: result.h[result.h.length - 1].j + 1
			};
			direction = 'h';
		} else if (result.v) {
			prevIndex = { i: result.v[0].i - 1, j: result.v[0].j };
			afterIndex = {
				i: result.v[result.v.length - 1].i + 1,
				j: result.v[result.v.length - 1].j
			};
			direction = 'v';
		} else if (result.d1) {
			prevIndex = { i: result.d1[0].i + 1, j: result.d1[0].j - 1 };
			afterIndex = {
				i: result.d1[result.d1.length - 1].i - 1,
				j: result.d1[result.d1.length - 1].j + 1
			};
			direction = 'd1';
		} else if (result.d2) {
			prevIndex = { i: result.d2[0].i - 1, j: result.d2[0].j - 1 };
			afterIndex = {
				i: result.d2[result.d2.length - 1].i + 1,
				j: result.d2[result.d2.length - 1].j + 1
			};
			direction = 'd2';
		}

		const resIndex1 = this.isIndexesAvailable([ prevIndex ]);
		const resIndex2 = this.isIndexesAvailable([ afterIndex ]);

		if (resIndex1 && resIndex2) {
			return this.moreSuitableIndex(prevIndex, afterIndex, direction);
		} else if (resIndex1) {
			return prevIndex;
		} else if (resIndex2) {
			return afterIndex;
		}
	}

	moreSuitableIndex({ i: i1, j: j1 }, { i: i2, j: j2 }, direction) {
		if (i1 === j2 && i2 === j1) {
			const no = this.randomNumber(1, 2);
			if (no === 2) return { i: i2, j: j2 };
			else if (no === 1) return { i: i1, j: j1 };
		}

		if (direction === 'h') {
			if (Math.abs(this.matrixSize / 2 - j1) > Math.abs(this.matrixSize / 2 - j2)) return { i: i2, j: j2 };
			else return { i: i1, j: j1 };
		} else if (direction === 'v') {
			if (Math.abs(this.matrixSize / 2 - i1) > Math.abs(this.matrixSize / 2 - i2)) return { i: i2, j: j2 };
			else return { i: i1, j: j1 };
		} else if (direction === 'd1') {
			if (Math.abs(this.matrixSize / 2 - i1) > Math.abs(this.matrixSize / 2 - i2)) return { i: i2, j: j2 };
			else return { i: i1, j: j1 };
		} else if (direction === 'd2') {
			console.log('here', Math.abs(this.matrixSize / 2 - i1), Math.abs(this.matrixSize / 2 - i2));
			if (Math.abs(this.matrixSize / 2 - i1) > Math.abs(this.matrixSize / 2 - i2)) return { i: i2, j: j2 };
			else return { i: i1, j: j1 };
		}
	}

	randomNumber(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	isIndexesAvailable(arr) {
		let flag = false;
		for (let i = 0; i < arr.length; i++) {
			if (
				arr[i].i >= 0 &&
				arr[i].j >= 0 &&
				arr[i].i < this.matrixSize &&
				arr[i].j < this.matrixSize &&
				this.gameBoard[arr[i].i][arr[i].j] === ''
			) {
				flag = true;
			} else {
				flag = false;
				break;
			}
		}
		return flag;
	}

	shuffle(array) {
		array.sort(() => Math.random() - 0.5);
	}

	minimax(depth, isMaximizingPlayer, alpha, beta) {
		if (this.checkForGameTermination()) {
			return this.scores[this.checkForGameTermination()];
		}

		if (isMaximizingPlayer) {
			let bestScore = -Infinity;

			for (let i = 0; i < this.matrixSize; i++) {
				for (let j = 0; j < this.matrixSize; j++) {
					if (this.gameBoard[i][j] === '') {
						this.gameBoard[i][j] = this.botSign;
						let score = this.minimax(depth + 1, false, alpha, beta);
						this.gameBoard[i][j] = '';
						// bestScore = Math.max(score, bestScore);
						// alpha = Math.max(alpha, bestScore);
						// if (beta <= alpha) break;

						if (score > alpha) {
							alpha = score;
						}

						if (alpha >= beta) {
							break;
						}
					}
				}
			}

			return alpha;
		} else {
			let bestScore = +Infinity;

			for (let i = 0; i < this.matrixSize; i++) {
				for (let j = 0; j < this.matrixSize; j++) {
					if (this.gameBoard[i][j] === '') {
						this.gameBoard[i][j] = this.opponentSign;
						let score = this.minimax(depth + 1, true, alpha, beta);
						this.gameBoard[i][j] = '';
						// bestScore = Math.min(score, bestScore);
						// beta = Math.min(beta, bestScore);
						// if (beta <= alpha) break;

						if (score < beta) {
							beta = score;
						}

						if (alpha >= beta) {
							break;
						}
					}
				}
			}

			return beta;
		}
	}

	printGameBoardToConsole() {
		for (let i = 0; i < this.matrixSize; i++) {
			for (let j = 0; j < this.matrixSize; j++) {
				console.log(this.gameBoard[i][j]);
			}
			console.log(' >> ');
		}
	}
}

module.exports = Bot;
