"use strict";

const audio = new Audio("sounds/alarm.wav");

let breakTimeDivisor = 4; // Used to determine the length of a break.
let milisecondsTime = 0;
let currentStatus = "paused";

// Receives messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "requestData") {
        console.log(
            "received requestData message in background.js",
            "status:",
            currentStatus,
            "time:",
            milisecondsTime
        );
        sendResponse({ status: currentStatus, time: milisecondsTime });
    } else if (request.action === "handleButtonClick") {
        if (currentStatus === "paused") {
            startWork();
        } else if (currentStatus === "work") {
            startBreak();
        } else if (currentStatus === "break") {
            pauseTimer();
        }
    }
});

// Resets and pauses the timer.
const pauseTimer = () => {
    currentStatus = "paused";
    milisecondsTime = 0;

    chrome.runtime.sendMessage({ action: "updateData", time: milisecondsTime, status: currentStatus });
    console.log("sent updateData message from background.js from pause timer");
};

// Starts the timer.
const startWork = () => {
    currentStatus = "work";
    audio.pause();

    const startTime = Date.now();

    const updateTime = () => {
        const currentTime = Date.now();
        milisecondsTime = currentTime - startTime;

        if (currentStatus !== "work") return;

        chrome.runtime.sendMessage({ action: "updateData", time: milisecondsTime, status: currentStatus });
        console.log("sent updateData message from background.js");
        setTimeout(updateTime, 200);
    };

    updateTime();
};

// Calculates the time and starts the break count down.
const startBreak = () => {
    currentStatus = "break";
    milisecondsTime = Math.floor(milisecondsTime / breakTimeDivisor);

    const startTime = Date.now();
    const breakTime = milisecondsTime;

    const updateTime = () => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        milisecondsTime = breakTime - elapsedTime;

        if (milisecondsTime <= 0) {
            audio.play();
            pauseTimer();
        }

        if (currentStatus !== "break") return;

        chrome.runtime.sendMessage({ action: "updateData", time: milisecondsTime, status: currentStatus });
        setTimeout(updateTime, 200);
    };

    updateTime();
};
