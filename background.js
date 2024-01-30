"use strict";

const audio = new Audio("sounds/alarm.wav");

let breakTimeDivisor; // Used to determine the length of a break.
let milisecondsTime;
let currentStatus;

chrome.storage.local.get(["breakTimeDivisor", "milisecondsTime", "currentStatus"], (result) => {
    console.log("init", "divisor:", breakTimeDivisor, "time", milisecondsTime, "status", currentStatus);

    breakTimeDivisor = result.breakTimeDivisor ?? 4;
    milisecondsTime = result.milisecondsTime ?? 0;
    currentStatus = result.currentStatus ?? "paused";

    console.log("after assignment", "divisor:", breakTimeDivisor, "time", milisecondsTime, "status", currentStatus);

    if (currentStatus === "work") {
        startWork();
    } else if (currentStatus === "break") {
        startBreak();
    }
});

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
    chrome.browserAction.setIcon({ path: "images/icon-pause.png" });
    milisecondsTime = 0;
    currentStatus = "paused";
    chrome.storage.local.set({ milisecondsTime: 0, currentStatus: "paused" });

    console.log("start pause", "time:", milisecondsTime);

    chrome.runtime.sendMessage({ action: "updateData", time: 0, status: "paused" });
    console.log("sent updateData message from background.js from pause timer");
};

// Starts the timer.
const startWork = () => {
    chrome.browserAction.setIcon({ path: "images/icon-work.png" });
    currentStatus = "work";
    chrome.storage.local.set({ currentStatus });

    audio.pause();

    console.log("start work", "time:", milisecondsTime);

    const startTime = Date.now() - milisecondsTime;

    const updateTime = () => {
        const currentTime = Date.now();
        milisecondsTime = currentTime - startTime;
        chrome.storage.local.set({ milisecondsTime });

        // chrome.storage.local.get("milisecondsTime", (result) => {
        //     console.log("time:", "google", result.milisecondsTime, "local", milisecondsTime);
        // });

        if (currentStatus !== "work") return;

        chrome.runtime.sendMessage({ action: "updateData", time: milisecondsTime, status: currentStatus });
        console.log("sent updateData message from background.js");
        setTimeout(updateTime, 200);
    };

    updateTime();
};

// Calculates the time and starts the break count down.
const startBreak = () => {
    chrome.browserAction.setIcon({ path: "images/icon-break.png" });
    currentStatus = "break";
    chrome.storage.local.set({ currentStatus: "break" });
    milisecondsTime = Math.floor(milisecondsTime / breakTimeDivisor);

    const startTime = Date.now();
    const breakTime = milisecondsTime;

    const updateTime = () => {
        if (currentStatus !== "break") return;

        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        milisecondsTime = breakTime - elapsedTime;
        chrome.storage.local.set({ milisecondsTime });

        console.log("updateTime break", "elapsed", elapsedTime, "time", milisecondsTime);

        if (milisecondsTime <= 0) {
            audio.play();
            pauseTimer();
        }

        chrome.runtime.sendMessage({ action: "updateData", time: milisecondsTime, status: currentStatus });
        setTimeout(updateTime, 200);
    };

    updateTime();
};
