const { ipcMain } = require('electron');
const fetch = require('node-fetch');

module.exports = (window) => {
    // TODO: Change timeout for event
    setTimeout(
        update_box, 5000
    );
    // update_box()

    function update_box() {
        let box;
        fetch('http://127.0.0.1:8000/api/sudoku/box')
            .then((response) => {
                response.json()
                .then((data) => {
                    box = data;
                    // console.log(box)
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
                "digit": args.digit
            }),
            headers: { 'Content-Type': 'application/json' },
        })
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
        })
        // TODO: write json response to history
        .then(update_box)
        .catch((err) => {
            console.log("ERROR: POST {/clear} query failed!")
        });
    });

    ipcMain.on("reset", () => {
        fetch('http://127.0.0.1:8000/api/sudoku/reset', {
            method: 'post',
        })
        .then(update_box)
        .catch((err) => {
            console.log("ERROR: POST {/reset} query failed!")
        });

        setTimeout(update_box, 2000)
    });

    // TODO: new dialog with result / stop clock / save results to db
    ipcMain.handle("isfull", (event, args) => 
        new Promise( (resolve, reject) => {
            fetch('http://127.0.0.1:8000/api/sudoku/isfull')
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
            fetch('http://127.0.0.1:8000/api/sudoku/check')
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
