// TODO: Encapsulate subprocess variable with control interface

// * Creating server subprocess *
const { spawn, exec } = require('child_process');
const fetch = require('node-fetch');

function promiseFromChildProcess(child) {
    return new Promise(function (resolve, reject) {
        child.addListener("error", reject);
        child.addListener("exit", resolve);
    });
}

module.exports.start = function start_server(PYPATH, PORT) { 
    PYPATH = PYPATH | "python";
    PORT = PORT | "8000";

    // TODO: Transform pathes to path objects
    const python = spawn("python", ["G:\\Dev\\Projects\\Eldoku\\server\\server.py", PORT])
    promiseFromChildProcess(python).then(
        (result) => console.log('promise complete: ' + result), 
        (err) => console.log('promise rejected: ' + err)
    );


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

    return python;
};