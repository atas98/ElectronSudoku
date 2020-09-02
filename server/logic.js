const { ipcMain } = require('electron');
const fetch = require('node-fetch');
// Is it nessesary to do server queries at node part?

module.exports = (window) => {
    // TODO: Change timeout for event
    setTimeout(
        update_box, 5000
    );
    // update_box()

    function update_box() {
        let box;
        fetch('http://127.0.0.1:8000/box')
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
        fetch('http://127.0.0.1:8000/guess', {
            method: 'post',
            body:    JSON.stringify({
                "coords": [args.coords.x, args.coords.y],
                "digit": args.digit
            }),
            headers: { 'Content-Type': 'application/json' },
        }).catch((err) => {
            console.log("ERROR: POST {/guess} query failed!")
        });
        update_box()
    });

    // TODO: Make it possible for reject check without fully writed box
    // TODO: new dialog with result / stop clock / save results to db
    ipcMain.handle("check", async (event, args) => 
        new Promise( (resolve, reject) => {
            fetch('http://127.0.0.1:8000/check')
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
