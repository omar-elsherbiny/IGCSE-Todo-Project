
let timer;
let timerDuration = 300;
let paused = false;
let elapsedTime = 0;

const padZero = (value) => (value < 10 ? '0' + value : value);

function startTimer() {
    if (timer) {
        clearInterval(timer);
    }

    localStorage.setItem('timer_duration', timerDuration);
    elapsedTime = 0;
    paused = false;
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
                resetTimer();
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
    document.querySelector('#start_controls').classList.toggle('hide');
    document.querySelector('#playing_controls').classList.toggle('hide');
}

function updateTimerDisplay() {
    const remainingTime = timerDuration - elapsedTime;
    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;
    localStorage.setItem('timer_remaining', remainingTime);

    if (hours > 0) {
        document.querySelector('#timer h5').textContent = hours + ':' + padZero(minutes) + ':' + padZero(seconds);
    } else {
        document.querySelector('#timer h5').textContent = minutes + ':' + padZero(seconds);
    }
}

function addTimer(time) {
    timerDuration = (timerDuration + time) > 0 ? (timerDuration + time) : 30;

    const hours = Math.floor(timerDuration / 3600);
    const minutes = Math.floor((timerDuration % 3600) / 60);
    const seconds = timerDuration % 60;

    if (hours > 0) {
        document.querySelector('#timer h5').textContent = hours + ':' + padZero(minutes) + ':' + padZero(seconds);
    } else {
        document.querySelector('#timer h5').textContent = minutes + ':' + padZero(seconds);
    }
}

if (localStorage.getItem('timer_remaining') && localStorage.getItem('timer_remaining')!=localStorage.getItem('timer_duration')) {
    timerDuration=Number(localStorage.getItem('timer_remaining'));
    startTimer();
    pauseTimer();
}