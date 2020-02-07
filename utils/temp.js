// //put
// // for (let i = 0; i < this.matrixSize; i++) {
// // 	for (let j = 0; j < this.matrixSize; j++) {
// // 		if (this.gameBoard[i][j] === '') {
// // 			this.gameBoard[i][j] = this.botSign;
// // 			const result = this.checkForGameTermination();
// // 			this.gameBoard[i][j] = '';

// // 			if (result === this.botSign) {
// // 				return { i, j };
// // 			}
// // 		}
// // 	}
// // }

// // //defense
// // for (let i = 0; i < this.matrixSize; i++) {
// // 	for (let j = 0; j < this.matrixSize; j++) {
// // 		if (this.gameBoard[i][j] === '') {
// // 			this.gameBoard[i][j] = this.opponentSign;
// // 			const result = this.checkForGameTermination();
// // 			this.gameBoard[i][j] = '';

// // 			if (result === this.opponentSign) {
// // 				return { i, j };
// // 			}
// // 		}
// // 	}
// // }

// //horizontal checking: Player
// for (let i = 0; i < this.matrixSize; i++) {
// 	possibles['h_' + i] = [];
// 	noOfMoves['h_' + i] = [];

// 	let tempCount = 0;
// 	for (let j = 0; j < this.matrixSize; j++) {
// 		if (this.gameBoard[i][j] === '') {
// 			this.gameBoard[i][j] = this.opponentSign;
// 			possibles['h_' + i].push({ i, j });
// 			tempCount++;

// 			const result = this.checkForGameTermination();
// 			if (result === this.opponentSign) {
// 				noOfMoves['h_' + i].push({ moves: tempCount });
// 				break;
// 			}
// 		}
// 	}

// 	for (let j = 0; j < possibles['h_' + i].length; j++) {
// 		const index = possibles['h_' + i][j];
// 		this.gameBoard[index.i][index.j] = '';
// 	}
// }

// //vertical checking: Player
// for (let i = 0; i < this.matrixSize; i++) {
// 	possibles['v_' + i] = [];
// 	noOfMoves['v_' + i] = [];

// 	let tempCount = 0;
// 	for (let j = 0; j < this.matrixSize; j++) {
// 		if (this.gameBoard[j][i] === '') {
// 			this.gameBoard[j][i] = this.opponentSign;
// 			possibles['v_' + i].push({ i: j, j: i });
// 			tempCount++;

// 			const result = this.checkForGameTermination();
// 			if (result === this.opponentSign) {
// 				noOfMoves['v_' + i].push({ moves: tempCount });
// 				break;
// 			}
// 		}
// 	}

// 	for (let j = 0; j < possibles['v_' + i].length; j++) {
// 		const index = possibles['v_' + i][j];
// 		this.gameBoard[index.i][index.j] = '';
// 	}
// }

// //check for diagonal 1: Player
// for (let k = 0; k <= 2 * this.matrixSize; ++k) {
// 	possibles['d1_' + k] = [];
// 	noOfMoves['d1_' + k] = [];

// 	let tempCount = 0;
// 	for (let y = this.matrixSize - 1; y >= 0; --y) {
// 		let x = k - y;
// 		if (x >= 0 && x < this.matrixSize) {
// 			if (this.gameBoard[y][x] === '') {
// 				this.gameBoard[y][x] = this.opponentSign;
// 				possibles['d1_' + k].push({ i: y, j: x });
// 				tempCount++;

// 				const result = this.checkForGameTermination();
// 				if (result === this.opponentSign) {
// 					noOfMoves['d1_' + k].push({ moves: tempCount });
// 					break;
// 				}
// 			}
// 		}
// 	}

// 	for (let j = 0; j < possibles['d1_' + k].length; j++) {
// 		const index = possibles['d1_' + k][j];
// 		this.gameBoard[index.i][index.j] = '';
// 	}
// }

// //check for diagonal 2: Player
// for (let k = 0; k <= 2 * this.matrixSize; ++k) {
// 	possibles['d2_' + k] = [];
// 	noOfMoves['d2_' + k] = [];

// 	let tempCount = 0;
// 	for (let y = 0; y < this.matrixSize; y++) {
// 		let x = k - (this.matrixSize - y);
// 		if (x >= 0 && x < this.matrixSize) {
// 			if (this.gameBoard[y][x] === '') {
// 				this.gameBoard[y][x] = this.opponentSign;
// 				possibles['d2_' + k].push({ i: y, j: x });
// 				tempCount++;

// 				const result = this.checkForGameTermination();
// 				if (result === this.opponentSign) {
// 					noOfMoves['d2_' + k].push({ moves: tempCount });
// 					break;
// 				}
// 			}
// 		}
// 	}

// 	for (let j = 0; j < possibles['d2_' + k].length; j++) {
// 		const index = possibles['d2_' + k][j];
// 		this.gameBoard[index.i][index.j] = '';
// 	}
// }

// let minMoves = Infinity;
// let minKey;
// Object.keys(noOfMoves).forEach((val, index) => {
// 	if (noOfMoves[val].length === 0) {
// 		delete possibles[val];
// 		delete noOfMoves[val];
// 	} else if (noOfMoves[val][0].moves === this.winCount) {
// 		delete possibles[val];
// 		delete noOfMoves[val];
// 	} else {
// 		if (noOfMoves[val][0].moves <= minMoves) {
// 			minMoves = noOfMoves[val][0].moves;
// 			minKey = val;
// 		}
// 	}
// });

// console.log('>>');

// console.log(minMoves, minKey, possibles, noOfMoves);

// if (minMoves !== Infinity) {
// 	return possibles[minKey][possibles[minKey].length - 1];
// }

// possibles = {};
// noOfMoves = {};

// //horizontal checking: Bot
// for (let i = 0; i < this.matrixSize; i++) {
// 	possibles['h_' + i] = [];
// 	noOfMoves['h_' + i] = [];

// 	let tempCount = 0;
// 	for (let j = 0; j < this.matrixSize; j++) {
// 		if (this.gameBoard[i][j] === '') {
// 			this.gameBoard[i][j] = this.botSign;
// 			possibles['h_' + i].push({ i, j });
// 			tempCount++;

// 			const result = this.checkForGameTermination();
// 			if (result === this.botSign || result === 'tie') {
// 				noOfMoves['h_' + i].push({ moves: tempCount });
// 				break;
// 			}
// 		}
// 	}

// 	for (let j = 0; j < possibles['h_' + i].length; j++) {
// 		const index = possibles['h_' + i][j];
// 		this.gameBoard[index.i][index.j] = '';
// 	}
// }

// //vertical checking:Bot
// for (let i = 0; i < this.matrixSize; i++) {
// 	possibles['v_' + i] = [];
// 	noOfMoves['v_' + i] = [];

// 	let tempCount = 0;
// 	for (let j = 0; j < this.matrixSize; j++) {
// 		if (this.gameBoard[j][i] === '') {
// 			this.gameBoard[j][i] = this.botSign;
// 			possibles['v_' + i].push({ i: j, j: i });
// 			tempCount++;

// 			const result = this.checkForGameTermination();
// 			if (result === this.botSign || result === 'tie') {
// 				noOfMoves['v_' + i].push({ moves: tempCount });
// 				break;
// 			}
// 		}
// 	}

// 	for (let j = 0; j < possibles['v_' + i].length; j++) {
// 		const index = possibles['v_' + i][j];
// 		this.gameBoard[index.i][index.j] = '';
// 	}
// }

// //check for diagonal 1:Bot
// for (let k = 0; k <= 2 * this.matrixSize; ++k) {
// 	possibles['d1_' + k] = [];
// 	noOfMoves['d1_' + k] = [];

// 	let tempCount = 0;
// 	for (let y = this.matrixSize - 1; y >= 0; --y) {
// 		let x = k - y;
// 		if (x >= 0 && x < this.matrixSize) {
// 			if (this.gameBoard[y][x] === '') {
// 				this.gameBoard[y][x] = this.botSign;
// 				possibles['d1_' + k].push({ i: y, j: x });
// 				tempCount++;

// 				const result = this.checkForGameTermination();
// 				if (result === this.botSign || result === 'tie') {
// 					noOfMoves['d1_' + k].push({ moves: tempCount });
// 					break;
// 				}
// 			}
// 		}
// 	}

// 	for (let j = 0; j < possibles['d1_' + k].length; j++) {
// 		const index = possibles['d1_' + k][j];
// 		this.gameBoard[index.i][index.j] = '';
// 	}
// }

// //check for diagonal 2:Bot
// for (let k = 0; k <= 2 * this.matrixSize; ++k) {
// 	possibles['d2_' + k] = [];
// 	noOfMoves['d2_' + k] = [];

// 	let tempCount = 0;
// 	for (let y = 0; y < this.matrixSize; y++) {
// 		let x = k - (this.matrixSize - y);
// 		if (x >= 0 && x < this.matrixSize) {
// 			if (this.gameBoard[y][x] === '') {
// 				this.gameBoard[y][x] = this.botSign;
// 				possibles['d2_' + k].push({ i: y, j: x });
// 				tempCount++;

// 				const result = this.checkForGameTermination();
// 				if (result === this.botSign || result === 'tie') {
// 					noOfMoves['d2_' + k].push({ moves: tempCount });
// 					break;
// 				}
// 			}
// 		}
// 	}

// 	for (let j = 0; j < possibles['d2_' + k].length; j++) {
// 		const index = possibles['d2_' + k][j];
// 		this.gameBoard[index.i][index.j] = '';
// 	}
// }

// minMoves = Infinity;
// minKey;
// Object.keys(noOfMoves).forEach((val, index) => {
// 	if (noOfMoves[val].length === 0) {
// 		delete possibles[val];
// 		delete noOfMoves[val];
// 	} else {
// 		if (noOfMoves[val][0].moves < minMoves) {
// 			minMoves = noOfMoves[val][0].moves;
// 			minKey = val;
// 		}
// 	}
// });

// if (minMoves !== Infinity && minMoves !== this.winCount) {
// 	return possibles[minKey][0];
// }
