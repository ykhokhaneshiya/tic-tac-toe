//circle start
let progressBar = document.querySelector('.e-c-progress');
let indicator = document.getElementById('e-indicator');
let pointer = document.getElementById('e-pointer');
let length = Math.PI * 2 * 100;

progressBar.style.strokeDasharray = length;

function update(value, timePercent) {
	var offset = -length - length * value / timePercent;
	progressBar.style.strokeDashoffset = offset;
	pointer.style.transform = `rotate(${360 * value / timePercent}deg)`;
}

//circle ends
const displayOutput = document.querySelector('.display-remain-time');

let intervalTimer;
let timeLeft;
let wholeTime = 10; // manage this to set the whole time

update(wholeTime, wholeTime); //refreshes progress bar
displayTimeLeft(wholeTime);

function changeWholeTime(seconds) {
	if (wholeTime + seconds > 0) {
		wholeTime += seconds;
		update(wholeTime, wholeTime);
	}
}

export function timer(seconds) {
	//counts time, takes seconds
	let remainTime = Date.now() + seconds * 1000;
	displayTimeLeft(seconds);

	intervalTimer = setInterval(function() {
		timeLeft = Math.round((remainTime - Date.now()) / 1000);
		if (timeLeft < 0) {
			clearInterval(intervalTimer);
			displayTimeLeft(wholeTime);
			return;
		}
		displayTimeLeft(timeLeft);
	}, 1000);
}

export function clearTimer() {
	clearInterval(intervalTimer);
}

function displayTimeLeft(timeLeft) {
	//displays time on the input
	let minutes = Math.floor(timeLeft / 60);
	let seconds = timeLeft % 60;
	// let displayString = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
	let displayString = `${seconds}`;
	displayOutput.textContent = displayString;
	update(timeLeft, wholeTime);
}
