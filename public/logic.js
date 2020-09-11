const { dialog } = require('electron').remote;
const {ipcRenderer} = require('electron');
const fetch = require('fetch-timeout');

const SETTINGS = require('./settings.json')
const Session = require('./session.js');
let session = new Session(Session.select_methods.DIGIT, SETTINGS.MAXHiSTORYLEN, SETTINGS.MAXHiSTORYLEN);

document.getElementsByTagName("main")[0].addEventListener("click", () => {
    session.selected_coords = []
});

function init_box() {
    fetch('http://127.0.0.1:8000/api/sudoku/initial_box', {}, SETTINGS.FETCH_TIMEOUT)
        .then((response) => {
            response.json()
            .then((box) => {
                for (let i = 0, row; row = table.rows[i]; i++) {
                    for (let j = 0, cell; cell = row.cells[j]; j++) {
                        let elem = cell.getElementsByTagName('button')[0];
                        // Clear all classes from button
                        elem.classList.forEach(elem_class => elem.classList.remove(elem_class))
                        if (box[i][j] !== 0) {
                            elem.classList.add('initial');
                            elem.textContent = box[i][j];
                        } else {
                            elem.classList.add('normal');
                            elem.textContent = '';
                        }
                    }  
                }
            })
        })
        .catch((err) => {
            console.log("ERROR: GET {/initial_box} query failed!")
    })
}

// * Update box *
function update_box() {
    fetch('http://127.0.0.1:8000/api/sudoku/box', {}, SETTINGS.FETCH_TIMEOUT)
        .then((response) => {
            response.json()
            .then((box) => {
                for (let i = 0, row; row = table.rows[i]; i++) {
                    for (let j = 0, cell; cell = row.cells[j]; j++) {
                        if (box[i][j] !== 0) {
                            cell.getElementsByTagName('button')[0].textContent = box[i][j];
                        } else {
                            cell.getElementsByTagName('button')[0].textContent = '';
                        }
                    }
                }
            })
        })
        .catch((err) => {
            console.log("ERROR: GET {/box} query failed!")
    })
}

async function game_field_click(event) {
    let col_idx = event.target.parentElement.cellIndex;
    let row_idx = event.target.parentElement.parentElement.rowIndex; 
            
    // game_field_click(row_idx, col_idx, event.target);

    // if (session.SELECT_METHOD === Session.select_methods.COORDS) {
    //     button.addEventListener("mouseenter", (event) => {
    //         let col_idx = event.target.parentElement.cellIndex;
    //         let row_idx = event.target.parentElement.parentElement.rowIndex; 
            
    //         if ( !session.selected_coords.includes({ "x":row_idx, "y":col_idx }) ) {
    //             session.selected_coords.push({ "x":row_idx, "y":col_idx })
    //         }
    //     });
    // }


    //TODO: Split mods into functions and initialize game_field_click with reference
    if (session.MODE === Session.mods.NORMAL) {
        if (session.SELECT_METHOD === Session.select_methods.DIGIT) {    
            let curr_digit = Number(table.rows[row_idx].cells[col_idx].getElementsByTagName('button')[0].textContent)
            let result = await guess({"x": row_idx, "y": col_idx}, session.selected_digit, false);
            if (result) {
                session.undo_history.push(
                    Session.create_history_object(
                        Session.actions.PLACE_DIGIT, 
                        {"x":row_idx, "y":col_idx},
                        curr_digit
                ));
            }
        } else {
            // TODO: Handler for {SELECT_METHOD: COORDS}
        }
    } else if (session.MODE === Session.mods.NOTE) {
        if (session.SELECT_METHOD === Session.select_methods.DIGIT) {
            // TODO: note mode logic
        } else {
            // TODO: note mode logic
        }
    } else if (session.MODE === Session.mods.COLOR) {
        if (session.SELECT_METHOD === Session.select_methods.DIGIT) {
            // TODO: color mode logic
        } else {
            // TODO: color mode logic
        }
    }
}

async function guess (coords, digit, autocheck) {
    let status = false;
    try {
        let response = await fetch('http://127.0.0.1:8000/api/sudoku/guess', {
            method: 'post',
            body:    JSON.stringify({
                "coords": [coords.x, coords.y],
                "digit": digit,
                "autocheck": autocheck
            }),
            headers: { 'Content-Type': 'application/json' },
        }, SETTINGS.FETCH_TIMEOUT)
        status = await response.json()
    } catch(err) {
        console.log("ERROR: POST {/guess} query failed!")
    }

    update_box()
    return status;
}


function clear_button_click() {
    fetch('http://127.0.0.1:8000/api/sudoku/clear', {
        method: 'post',
    }, SETTINGS.FETCH_TIMEOUT)
    .then((response) => {
        response.json()
        .then((history_data) => {
            // [[[x, y], d], ...] => [{"coords": {"x": x, "y": y}, "digit": d}, ...]
            let structured_data = history_data.map(el => Session.create_history_object(Session.actions.PLACE_DIGIT, {"x": el[0][0], "y": el[0][1]}, el[1]))
            session.undo_history.push(structured_data)
        })
    })
    .then(update_box)
    .catch((err) => {
        console.log("ERROR: POST {/clear} query failed!")
    });
}


function reset_button_click() {
    fetch('http://127.0.0.1:8000/api/sudoku/reset', {
        method: 'post',
    }, SETTINGS.FETCH_TIMEOUT)
    .then(init_box)
    .catch((err) => {
        console.log("ERROR: POST {/reset} query failed!")
    });
    
    // TODO: Uncheck mod radio and digit radio
    session = new Session(Session.select_methods.DIGIT, 200, 200);
    sw = resetStopWatch()
}


async function check_button_click() {
    let isfull_response = false;
    try {
        isfull_response = await fetch('http://127.0.0.1:8000/api/sudoku/isfull', {}, SETTINGS.FETCH_TIMEOUT)
    } catch {
        reject("ERROR: GET {/isfull} query failed! O_o")
    }
    if (await isfull_response.json()) {
        let check_response = false;
        try {
            check_response = await fetch('http://127.0.0.1:8000/api/sudoku/check', {}, SETTINGS.FETCH_TIMEOUT)
            check_response = await check_response.json()
        }
        catch(err) {
            reject("ERROR: GET {/check} query failed! O_o")
        }
            
        if (check_response) {
            stopStopWatch(sw);
        }
        console.log(check_response ? "OK!" : "Wrong!");
        // * Messagebox on check click *
        let options  = {
            buttons: ["OK"]
        }
        if (check_response) {
            options.message = `Solved! Your time: ${timeCurrent}`;
        } else {
            options.message = "Wrong!"
        }
        dialog.showMessageBox(options)
    }
}


function undo_button_click() {
    if (!session.undo_history.length) return;

    if (session.undo_history[session.undo_history.length-1] instanceof Array) {
        let actions = session.undo_history.pop();
        
        for ( action of actions ) {
            let curr_digit = Number(table.rows[action.coords["x"]].cells[action.coords["y"]].getElementsByTagName('button')[0].textContent)
            session.redo_history.push(
                Session.create_history_object(
                    Session.actions.PLACE_DIGIT, 
                    action.coords,
                    curr_digit 
            ));
            
            if (action.type === Session.actions.PLACE_DIGIT) {
                guess(action.coords, action.digit, false);
            }
        }
    } else {
        let action = session.undo_history.pop();

        let curr_digit = Number(table.rows[action.coords["x"]].cells[action.coords["y"]].getElementsByTagName('button')[0].textContent)
            session.redo_history.push(
                Session.create_history_object(
                    Session.actions.PLACE_DIGIT, 
                    action.coords,
                    curr_digit 
            ));
            
            if (action.type === Session.actions.PLACE_DIGIT) {
                guess(action.coords, action.digit, false)
            }
    }
}

function redo_button_click() {
    if (!session.redo_history.length) return;

    let action = session.redo_history.pop()
    let curr_digit = Number(table.rows[action.coords["x"]].cells[action.coords["y"]].getElementsByTagName('button')[0].textContent)

    session.undo_history.push(
        Session.create_history_object(
            Session.actions.PLACE_DIGIT, 
            action.coords,
            curr_digit 
    ));
    if (action.type === Session.actions.PLACE_DIGIT) {
        guess(action.coords, action.digit, false);
    }
}