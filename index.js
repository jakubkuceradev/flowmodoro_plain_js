const statusPausedMessage = "Start the Timer!";
const statusWorkMessage = "Get to Work!";
const statusBreakMessage = "Take a Break!";

let colorPaused = "#ffff00";
let colorWork = "#ff0000";
let colorBreak = "#00ff2f";
let minutesTime = "00";
let secondsTime = "00";
let breakTimeDivisor = 3;
let statusMessage = statusPausedMessage;
let intervalFunction;

window.onload = () => {
    document.getElementById("status-message").innerText = statusPausedMessage;
    document.getElementById("minutes").innerText = "00";
    document.getElementById("seconds").innerText = "00";

    document.documentElement.style.setProperty("--color-secondary", colorPaused);
};

const formatTime = (number) => {
    return String(number).padStart(2, "0");
};

const startWork = () => {
    document.documentElement.style.setProperty("--color-secondary", colorWork);
    document.getElementById("status-message").innerText = statusWorkMessage;
    document.getElementById("work-break").onclick = startBreak;

    secondsTime = 0;
    minutesTime = 0;

    const countUp = () => {
        secondsTime++;

        if (secondsTime == 60) {
            secondsTime = 0;
            minutesTime++;
        }

        document.getElementById("seconds").innerText = formatTime(secondsTime);
        document.getElementById("minutes").innerText = formatTime(minutesTime);
        console.log("work", minutesTime, secondsTime);
    };

    intervalFunction = setInterval(countUp, 1000);
};

const pauseTimer = () => {
    clearInterval(intervalFunction);

    secondsTime = 0;
    minutesTime = 0;

    document.documentElement.style.setProperty("--color-secondary", colorPaused);
    document.getElementById("seconds").innerText = formatTime(secondsTime);
    document.getElementById("minutes").innerText = formatTime(minutesTime);
    document.getElementById("work-break").onclick = startWork;
};

const startBreak = () => {
    clearInterval(intervalFunction);

    document.documentElement.style.setProperty("--color-secondary", colorBreak);
    document.getElementById("status-message").innerText = statusBreakMessage;
    document.getElementById("work-break").onclick = pauseTimer;

    const dividedSeconds = (minutesTime * 60 + secondsTime) / breakTimeDivisor;

    minutesTime = Math.floor(dividedSeconds / 60);
    secondsTime = Math.floor(dividedSeconds % 60);

    const countDown = () => {
        secondsTime--;

        if (secondsTime === -1) {
            secondsTime = 59;
            minutesTime--;

            if (minutesTime < 0) {
                pauseTimer();
                return;
            }
        }

        document.getElementById("seconds").innerText = formatTime(secondsTime);
        document.getElementById("minutes").innerText = formatTime(minutesTime);
        console.log("break", minutesTime, secondsTime);
    };

    intervalFunction = setInterval(countDown, 1000);
};
