// TODO: Encapsulate subprocess variable with control interface

// * Creating server subprocess *
const { spawn } = require('child_process');
const path = require('path');
const fetch = require('fetch-timeout');

let python;


module.exports.start = function start_server(PYPATH, PORT, TIMEOUT) {
    python = spawn(PYPATH, [path.join(__dirname, "server.py"), PORT])

    python.on('start', (err) => {
        console.log('Started subprocess.');
    });
    
    python.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
      
    python.stderr.on('data', (data) => {
        console.log(`${data}`);
    });
    
    python.on('close', (code) => {
        console.log(`closed: ${code}`);
    });

    return new Promise((resolve, reject) => {
        let counter;
        const ping = setInterval(() => {
            if (counter > 20) {
                reject(522);
            } else {
                counter++;
                fetch('http://127.0.0.1:8000/api/sudoku/box', {}, 1000)
                .then(() => {
                    clearInterval(ping)
                    resolve(200)
                });
            }
        }, 1000);
      });
}

module.exports.stop = function stop_server(PYPATH, PORT) { 
    return python.kill('SIGTERM')
};