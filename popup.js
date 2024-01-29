"use strict";

const STATUSPAUSEDMESSAGE = "Start the Timer!";
const STATUSWORKMESSAGE = "Get to Work!";
const STATUSBREAKMESSAGE = "Take a Break!";

const COLORPAUSED = "#ffff00";
const COLORWORK = "#ff0000";
const COLORBREAK = "#00ff2f";

let breakTimeDivisor = 1;
let milisecondsTime = 0;
let currentStatus = "paused";

document.addEventListener("DOMContentLoaded", () => {
    const buttonElement = document.getElementById("work-break");

    // pauseTimer();
    renderStatus();
    renderTime();

    buttonElement.addEventListener("click", (event) => {
        if (event.type !== "click") {
        } else if (currentStatus === "paused") {
            startWork();
        } else if (currentStatus === "work") {
            startBreak();
        } else if (currentStatus === "break") {
            pauseTimer();
        }
    });
});

// Resets and pauses the timer.
const pauseTimer = () => {
    currentStatus = "paused";
    milisecondsTime = 0;

    renderTime();
    renderStatus();
};

// Starts the timer.
const startWork = () => {
    currentStatus = "work";
    milisecondsTime = 0;

    renderTime();
    renderStatus();

    const startTime = Date.now();

    const updateTime = () => {
        const currentTime = Date.now();
        milisecondsTime = currentTime - startTime;

        if (currentStatus !== "work") return;

        renderTime();
        setTimeout(updateTime, 200);
    };

    updateTime();
};

// Calculates the time and starts the break count down.
const startBreak = () => {
    currentStatus = "break";
    milisecondsTime = Math.floor(milisecondsTime / breakTimeDivisor);

    renderTime();
    renderStatus();

    const startTime = Date.now();
    const breakTime = milisecondsTime;

    const updateTime = () => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        milisecondsTime = breakTime - elapsedTime;

        if (milisecondsTime <= 0) pauseTimer();
        if (currentStatus !== "break") return;

        renderTime();
        setTimeout(updateTime, 200);
    };

    updateTime();
};

// Updates the shown status message and the color of the timer.
const renderStatus = () => {
    const color = (() => {
        if (currentStatus === "paused") return COLORPAUSED;
        else if (currentStatus === "work") return COLORWORK;
        else if (currentStatus === "break") return COLORBREAK;
    })();

    const statusMessage = (() => {
        if (currentStatus === "paused") return STATUSPAUSEDMESSAGE;
        else if (currentStatus === "work") return STATUSWORKMESSAGE;
        else if (currentStatus === "break") return STATUSBREAKMESSAGE;
    })();

    document.documentElement.style.setProperty("--color-secondary", color);
    document.getElementById("status-message").textContent = statusMessage;
};

// Updates the shown time.
const renderTime = () => {
    const minutesTime = Math.floor(milisecondsTime / (1000 * 60));
    const secondsTime = Math.floor(milisecondsTime / 1000 - minutesTime * 60);

    document.getElementById("minutes").textContent = formatTime(minutesTime);
    document.getElementById("seconds").textContent = formatTime(secondsTime);
};

// Pads single digit numbers with a zero and returns number as a string.
const formatTime = (number) => {
    return String(number).padStart(2, "0");
};
