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
    document.querySelector('.timer_clock h5').style.animation = 'scale_bounce2 ease-in-out 1s infinite';
    document.querySelector('.timer_clock div').style.animation = 'smol_background linear ' + timerDuration + 's';

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

function pauseTimer() {
    document.querySelector('.timer_clock h5').style.animation = '';
    document.querySelector('.timer_clock div').style.animationPlayState = 'paused';
    paused = true;
}

function resumeTimer() {
    paused = false;
    document.querySelector('.timer_clock h5').style.animation = 'scale_bounce2 ease-in-out 1s infinite';
    document.querySelector('.timer_clock div').style.animationPlayState = 'running';
}

function resetTimer() {
    clearInterval(timer);
    elapsedTime = 0;
    paused = false;
    document.querySelector('.timer_clock h5').style.animation = '';
    document.querySelector('.timer_clock div').style.animation = '';
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const timerDisplay = document.querySelector('.timer_clock h5');
    const remainingTime = timerDuration - elapsedTime;
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}