let timer;
let timerDuration;
let paused = false;
let elapsedTime = 0;

function startTimer(duration) {
    if (timer) {
        clearInterval(timer);
    }

    timerDuration = duration;
    elapsedTime = 0;
    paused = false;

    updateTimerDisplay();

    timer = setInterval(function () {
        if (!paused) {
            elapsedTime += 1;
            updateTimerDisplay();

            if (elapsedTime >= timerDuration) {
                clearInterval(timer);
            }
        }
    }, 1000);
}

function pauseTimer() {paused = true;}

function resumeTimer() {paused = false;}

function resetTimer() {
    clearInterval(timer);
    elapsedTime = 0;
    paused = false;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const timerDisplay = document.querySelector('.timer_clock h5');
    const remainingTime = timerDuration - elapsedTime;
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}