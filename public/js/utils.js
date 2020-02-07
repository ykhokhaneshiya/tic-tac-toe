const TURN_TIME = 10;

let timerFn;

export let startTimer = function(timer) {
	clearInterval(timerFn);
	let turnTime = TURN_TIME;
	return new Promise(function(resolve, reject) {
		timerFn = setInterval(function() {
			timer.textContent = turnTime--;
			if (turnTime < 0) {
				clearInterval(timerFn);
				resolve();
			}
		}, 1000);
	});
};

export let clearTimer = function() {
	clearInterval(timerFn);
};

export let createBoard = function() {};
