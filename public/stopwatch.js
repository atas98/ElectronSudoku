const sw = document.getElementById("Stopwatch")
let timeStart;
let timeCurrent;

function resetStopWatch() {
    timeStart = new Date().getTime();
    timeCurrent = new Date(0);
}

resetStopWatch();

setInterval(() => {
    timeCurrent = Date.now()-timeStart;
    timeCurrentSeconds = Math.floor((timeCurrent % (1000 * 60)) / 1000);
    timeCurrentMinutes = Math.floor((timeCurrent % (1000 * 60 * 60)) / (1000 * 60));

    sw.textContent = `${timeCurrentMinutes}:${timeCurrentSeconds < 10 ? "0"+timeCurrentSeconds : timeCurrentSeconds}`
}, 1000);

