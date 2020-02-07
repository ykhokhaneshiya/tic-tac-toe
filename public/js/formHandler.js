const form = document.getElementById('playForm');

form.addEventListener('submit', function(e) {
	e.preventDefault();

	const name = document.getElementById('name').value;
	const matrix = parseInt(document.getElementById('matrix').value);
	const winCount = parseInt(document.getElementById('winCount').value);
	const message = document.getElementsByClassName('message')[0];

	console.log(winCount, matrix, winCount > matrix);

	if (winCount > matrix || winCount <= 2) {
		message.innerHTML = 'Please enter valid win count!';
		return false;
	} else {
		message.innerHTML = '';
	}

	sessionStorage.name = name;
	sessionStorage.matrixSize = matrix;
	sessionStorage.winCount = winCount;

	window.location = '/game';
});
