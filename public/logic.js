const { dialog } = require('electron').remote;
const { ipcRenderer } = require('electron');
const fetch = require('fetch-timeout');

const SETTINGS = require('./settings.json')
const Session = require('./session.js');
let session = new Session(Session.select_methods.DIGIT, SETTINGS.MAXHiSTORYLEN, SETTINGS.MAXHiSTORYLEN);

document.getElementsByTagName("main")[0].addEventListener("click", () => {
    session.selected_coords = []
});

async function init_box() {
    let response;
    try {
        response = await fetch('http://127.0.0.1:8000/api/sudoku/initial_box', {}, SETTINGS.FETCH_TIMEOUT)
    }
    catch {
        throw "ERROR: GET {/initial_box} query failed!"
    }
    let box = await response.json()
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
}

// * Update box *
async function update_box() {
    let box;
    try {
        box = await (await fetch('http://127.0.0.1:8000/api/sudoku/box', {}, SETTINGS.FETCH_TIMEOUT)).json()
    } catch {
        throw "ERROR: GET {/box} query failed!"
    }    

    for (let i = 0, row; row = table.rows[i]; i++) {
        for (let j = 0, cell; cell = row.cells[j]; j++) {
            if (box[i][j] !== 0) {
                cell.getElementsByTagName('button')[0].textContent = box[i][j];
            } else {
                cell.getElementsByTagName('button')[0].textContent = '';
            }
        }
    }
}

async function game_field_click(event) {
    let col_idx = event.target.parentElement.cellIndex;
    let row_idx = event.target.parentElement.parentElement.rowIndex; 
            
    // ! session.SELECT_METHOD === Session.select_methods.COORDS
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
    curr_cell = table.rows[row_idx].cells[col_idx].getElementsByTagName('button')[0]
    if (session.MODE === Session.mods.NORMAL) {
        if (session.SELECT_METHOD === Session.select_methods.DIGIT) {
            let result = await guess({"x": row_idx, "y": col_idx}, session.selected_digit, false);
            if (result) {
                let curr_digit = Number(curr_cell.textContent)
                if (isgrid(event.target)) {
                    session.undo_history.push(
                        Session.create_history_object(
                            Session.actions.REMOVE_NOTE, 
                            {"x":row_idx, "y":col_idx},
                            remove_notegrid(event.target) // array of notnull notes
                    ));
                } else {
                    session.undo_history.push(
                        Session.create_history_object(
                            Session.actions.PLACE_DIGIT, 
                            {"x":row_idx, "y":col_idx},
                            curr_digit
                    ));
                }
            }
        } else {
            // TODO: Handler for {SELECT_METHOD: COORDS}
        }
    } else if (session.MODE === Session.mods.NOTE) {
        // FIXME: Raplacing note with digit replaces all notes
        // FIXME: Making note brokes history stacks
        if (session.SELECT_METHOD === Session.select_methods.DIGIT) {
            if (session.selected_digit) {
                if  (isgrid(event.target)) {
                // GRID
                    if (!event.target.childNodes[session.selected_digit-1].textContent) {
                        session.undo_history.push(
                            Session.create_history_object(
                                Session.actions.PLACE_NOTE, 
                                {"x":row_idx, "y":col_idx},
                                get_notesgrid(event.target) // returns array of notes
                        ));
                        event.target.childNodes[session.selected_digit-1].textContent = session.selected_digit;
                    } else {
                        session.undo_history.push(
                            Session.create_history_object(
                                Session.actions.REMOVE_NOTE, 
                                {"x":row_idx, "y":col_idx},
                                get_notesgrid(event.target) // returns array of notes
                        ));
                        event.target.childNodes[session.selected_digit-1].textContent = '';
                    }
                } else if (!event.target.innerHTML) { 
                // EMPTY
                    session.undo_history.push(
                        Session.create_history_object(
                            Session.actions.REMOVE_NOTE, 
                            {"x":row_idx, "y":col_idx},
                            0 // placing grid on empty cell
                    ));
                    link_notegrid(event.target)
                    event.target.childNodes[session.selected_digit-1].textContent = session.selected_digit
                }
            }
        } else {
            // TODO: note mode logic with coords mod
        }
    } else if (session.MODE === Session.mods.COLOR) {
        if (session.SELECT_METHOD === Session.select_methods.DIGIT) {
            // TODO: color mode logic
        } else {
            // TODO: color mode logic with coords mod
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


async function clear_button_click() {
    let history_data;
    try {
        history_data = await (await fetch('http://127.0.0.1:8000/api/sudoku/clear', {
            method: 'post',
        }, SETTINGS.FETCH_TIMEOUT)).json()
    } catch {
        throw "ERROR: POST {/clear} query failed!"
    }
    // [[[x, y], d], ...] => [{"coords": {"x": x, "y": y}, "digit": d}, ...]
    let structured_data = history_data.map(el => Session.create_history_object(Session.actions.PLACE_DIGIT, {"x": el[0][0], "y": el[0][1]}, el[1]))
    session.undo_history.push(structured_data)
    update_box()
}


async function reset_button_click() {
    try {
        await fetch('http://127.0.0.1:8000/api/sudoku/reset', {
            method: 'post',
        }, SETTINGS.FETCH_TIMEOUT)
    } catch {
        throw "ERROR: POST {/reset} query failed!"
    }

    init_box()

    for (let input of document.getElementsByTagName("input")) {
        if (input.type === "radio"){
            input.checked = false;
        }
    }
    
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

function link_notegrid(target) {
    let note_cells = []
    for(let i = 0; i < 9; i++) {
        let note_cell = document.createElement("small");
        target.appendChild(note_cell)
        target.classList.add("notes")
        note_cells.push(note_cell)
    }
    return note_cells;
}

function remove_notegrid(target) {
    target.classList.remove("notes")
    let notes = get_notesgrid(target)
    target.textContent = '';
    return notes
}

function get_notesgrid(target) {
    let notes = [];
    for (small of target.childNodes) {
        if (small.textContent) {            
            notes.push(small.textContent)
        }
    }
    return notes
}

function isgrid(cell) {
    return cell.classList.contains("notes")
}