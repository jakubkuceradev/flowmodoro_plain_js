"use strict";

const STATUSPAUSEDMESSAGE = "Start the Timer!";
const STATUSWORKMESSAGE = "Get to Work!";
const STATUSBREAKMESSAGE = "Take a Break!";

const COLORPAUSED = "#ffff00";
const COLORWORK = "#ff0000";
const COLORBREAK = "#00ff2f";

document.addEventListener("DOMContentLoaded", () => {
    const buttonElement = document.getElementById("work-break");

    chrome.runtime.sendMessage({ action: "requestData" }, (response) => {
        if (response) {
            console.log("response:", response, response.time, response.status);
            renderTime(response.time);
            renderStatus(response.status);
        }
    });

    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === "updateData") {
            console.log("received updateData message from background.js in popup.js");
            renderTime(request.time);
            renderStatus(request.status);
        }
    });

    buttonElement.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "handleButtonClick" });
    });
});

// Updates the shown status message and the color of the timer.
const renderStatus = (currentStatus) => {
    console.log("rendering status", "status:", currentStatus);

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

    console.log("setting color to", color, "in popup.js");

    document.documentElement.style.setProperty("--color-secondary", color);
    document.getElementById("status-message").textContent = statusMessage;
};

// Updates the shown time.
const renderTime = (milisecondsTime) => {
    const minutesTime = Math.floor(milisecondsTime / (1000 * 60));
    const secondsTime = Math.floor(milisecondsTime / 1000 - minutesTime * 60);

    document.title = `${formatTime(minutesTime)}:${formatTime(secondsTime)} Flowmodoro`;
    document.getElementById("minutes").textContent = formatTime(minutesTime);
    document.getElementById("seconds").textContent = formatTime(secondsTime);
};

// Pads single digit numbers with a zero and returns number as a string.
const formatTime = (number) => {
    return String(number).padStart(2, "0");
};
