
let timer;
let timerDuration = 300;
let paused = false;
let elapsedTime = 0;
var audio = new Audio('./static/timer.mp3');

const padZero = (value) => (value < 10 ? '0' + value : value);

function currentTime() {
    return Math.floor(new Date().getTime() / 1000);
}

function startTimer() {
    if (timer) {
        clearInterval(timer);
    }

    localStorage.setItem('timer_duration', timerDuration);
    localStorage.setItem('timer_first_epoch', currentTime());
    elapsedTime = 0;
    paused = false;
    document.querySelector('#start_controls').classList.toggle('hide');
    document.querySelector('#playing_controls').classList.toggle('hide');
    document.querySelector('.timer_clock h5').style.animation = 'scale_bounce2 ease-in-out 1s infinite';
    document.querySelector('.timer_clock div').style.animation = 'smol_background linear ' + timerDuration + 's';
    document.querySelector('.timer_clock').style.borderColor = 'whitesmoke';
    document.querySelector('#pauseBtn').classList.remove('hide');
    document.querySelector('#resumeBtn').classList.add('hide');

    updateTimerDisplay();

    timer = setInterval(function () {
        if (!paused) {
            elapsedTime += 1;
            updateTimerDisplay();

            if (elapsedTime >= timerDuration) {
                audio.play();
                document.querySelector('header').innerHTML += `
                <div class="alert" id="beep99">
                    <p>Timer Finished</p>
                    <svg onclick="hide_alert(99);audio.pause();audio.currentTime=0;" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 512 512">
                        <path
                            d="M437.5 386.6L306.9 256l130.6-130.6c14.1-14.1 14.1-36.8 0-50.9-14.1-14.1-36.8-14.1-50.9 0L256 205.1 125.4 74.5c-14.1-14.1-36.8-14.1-50.9 0-14.1 14.1-14.1 36.8 0 50.9L205.1 256 74.5 386.6c-14.1 14.1-14.1 36.8 0 50.9 14.1 14.1 36.8 14.1 50.9 0L256 306.9l130.6 130.6c14.1 14.1 36.8 14.1 50.9 0 14-14.1 14-36.9 0-50.9z"
                            fill="#888888" />
                    </svg>
                </div>`

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
    document.querySelector('.timer_clock').style.borderColor = 'var(--accent)';
}

function resumeTimer() {
    paused = false;
    document.querySelector('#pauseBtn').classList.toggle('hide');
    document.querySelector('#resumeBtn').classList.toggle('hide');
    document.querySelector('.timer_clock h5').style.animation = 'scale_bounce2 ease-in-out 1s infinite';
    document.querySelector('.timer_clock div').style.animationPlayState = 'running';
    document.querySelector('.timer_clock').style.borderColor = 'whitesmoke';
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
    document.querySelector('.timer_clock').style.borderColor = 'var(--accent)';
}

function updateTimerDisplay() {
    const remainingTime = timerDuration - elapsedTime;
    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;

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

if (localStorage.getItem('timer_duration')) {
    const first_epoch = Number(localStorage.getItem('timer_first_epoch'));
    const duration = Number(localStorage.getItem('timer_duration'));
    let timeLeft = duration - (currentTime() - first_epoch);
    if (timeLeft>0) {
        timerDuration = timeLeft;
        startTimer();
    }
}