let timer;
let timerDuration = 300;
let paused = false;
let elapsedTime = 0;

function startTimer() {
    if (timer) {
        clearInterval(timer);
    }

    elapsedTime = 0;
    paused = false;
    //document.querySelector('#timer h4').classList.toggle('hide');
    //document.querySelector('.timer_clock').classList.toggle('hide');
    document.querySelector('#start_controls').classList.toggle('hide');
    document.querySelector('#playing_controls').classList.toggle('hide');
    document.querySelector('.timer_clock h5').style.animation = 'scale_bounce2 ease-in-out 1s infinite';
    document.querySelector('.timer_clock div').style.animation = 'smol_background linear ' + timerDuration + 's';

    updateTimerDisplay();

    timer = setInterval(function () {
        if (!paused) {
            elapsedTime += 1;
            updateTimerDisplay();

            if (elapsedTime >= timerDuration) {
                //document.querySelector('#timer h4').classList.toggle('hide');
                //document.querySelector('.timer_clock').classList.toggle('hide');
                document.querySelector('#start_controls').classList.toggle('hide');
                document.querySelector('#playing_controls').classList.toggle('hide');
                clearInterval(timer);
            }
        }
    }, 1000);
}

function pauseTimer() {
    paused = true;
    document.querySelector('#pauseBtn').classList.toggle('hide');
    document.querySelector('#resumeBtn').classList.toggle('hide');
    document.querySelector('.timer_clock h5').style.animation = '';
    document.querySelector('.timer_clock div').style.animationPlayState = 'paused';
}

function resumeTimer() {
    paused = false;
    document.querySelector('#pauseBtn').classList.toggle('hide');
    document.querySelector('#resumeBtn').classList.toggle('hide');
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
    //document.querySelector('#timer h4').classList.toggle('hide');
    //document.querySelector('.timer_clock').classList.toggle('hide');
    document.querySelector('#start_controls').classList.toggle('hide');
    document.querySelector('#playing_controls').classList.toggle('hide');
}

function updateTimerDisplay() {
    const timerDisplay = document.querySelector('.timer_clock h5');
    const remainingTime = timerDuration - elapsedTime;
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function addTimer(time) {
    timerDuration = (timerDuration + time) > 0 ? (timerDuration + time) : timerDuration;
    const minutes = Math.floor(timerDuration / 60);
    const seconds = timerDuration % 60;
    document.querySelector('#timer h5').textContent = minutes + ':' + (seconds < 10 ? seconds + '0' : seconds);
}