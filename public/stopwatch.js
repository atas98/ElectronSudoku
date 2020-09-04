const sw_object = document.getElementById("Stopwatch")
let timeStart;
let timeCurrent;

// TODO: check/sync final time with server
function resetStopWatch() {
    timeStart = new Date().getTime();
    timeCurrent = new Date(0);

    return setInterval(() => {
        timeCurrent = Date.now()-timeStart;
        timeCurrentSeconds = Math.floor((timeCurrent % (1000 * 60)) / 1000);
        timeCurrentMinutes = Math.floor((timeCurrent % (1000 * 60 * 60)) / (1000 * 60));
    
        sw_object.textContent = `${timeCurrentMinutes}:${timeCurrentSeconds < 10 ? "0"+timeCurrentSeconds : timeCurrentSeconds}`
    }, 1000);
}

function stopStopWatch(w) {
    clearInterval(w)
} // xD

let sw = resetStopWatch();



