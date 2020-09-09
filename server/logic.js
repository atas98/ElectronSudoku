const { ipcMain } = require('electron');
const fetch = require('fetch-timeout');

module.exports = (window, OPTIONS) => {
    init_box()

    function init_box() {
        fetch('http://127.0.0.1:8000/api/sudoku/initial_box', {}, OPTIONS.FETCH_TIMEOUT)
            .then((response) => {
                response.json()
                .then((box) => {
                    window.webContents.send('init', box)
                })
            })
            .catch((err) => {
                console.log("ERROR: GET {/initial_box} query failed!")
        })
    }

    function update_box() {
        fetch('http://127.0.0.1:8000/api/sudoku/box', {}, OPTIONS.FETCH_TIMEOUT)
            .then((response) => {
                response.json()
                .then((box) => {
                    window.webContents.send('update', box)
                })
            })
            .catch((err) => {
                console.log("ERROR: GET {/box} query failed!")
        })
    }

    ipcMain.on("guess", (event, args) => {
        fetch('http://127.0.0.1:8000/api/sudoku/guess', {
            method: 'post',
            body:    JSON.stringify({
                "coords": [args.coords.x, args.coords.y],
                "digit": args.digit,
                "autocheck": args.autocheck
            }),
            headers: { 'Content-Type': 'application/json' },
        }, OPTIONS.FETCH_TIMEOUT)
        .then((response) => {
            response.json()
            .then((status) => {
                console.log(status)
                window.webContents.send('guess_status', status)
            }) 
        })
        .then(update_box)
        .catch((err) => {
            console.log("ERROR: POST {/guess} query failed!")
        });
    });

    ipcMain.on("clear", () => {
        fetch('http://127.0.0.1:8000/api/sudoku/clear', {
            method: 'post',
        }, OPTIONS.FETCH_TIMEOUT)
        .then((response) => {
            response.json()
            .then((data) => {
                window.webContents.send('clear-response', data)
            })
        })
        .then(update_box)
        .catch((err) => {
            console.log("ERROR: POST {/clear} query failed!")
        });
    });

    ipcMain.on("reset", () => {
        fetch('http://127.0.0.1:8000/api/sudoku/reset', {
            method: 'post',
        }, OPTIONS.FETCH_TIMEOUT)
        .then(init_box)
        .catch((err) => {
            console.log("ERROR: POST {/reset} query failed!")
        });

        setTimeout(update_box, 2000)
    });

     ipcMain.handle("isfull", (event, args) => 
        new Promise( (resolve, reject) => {
            fetch('http://127.0.0.1:8000/api/sudoku/isfull', {}, OPTIONS.FETCH_TIMEOUT)
            .then((response) => {
                response.json()
                .then((isfull_result) => {
                    resolve(isfull_result);
                });
            })
            .catch((err) => {
                reject("ERROR: GET {/isfull} query failed! O_o")
            })
        })
    );

    ipcMain.handle("check", (event, args) => 
        new Promise( (resolve, reject) => {
            fetch('http://127.0.0.1:8000/api/sudoku/check', {}, OPTIONS.FETCH_TIMEOUT)
            .then((response) => {
                response.json()
                .then((check_result) => {
                    resolve(check_result);
                });
            })
            .catch((err) => {
                reject("ERROR: GET {/check} query failed! O_o")
            })
        })
    );
};
