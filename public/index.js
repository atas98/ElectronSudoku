const {ipcRenderer} = require('electron');
const Session = require('./session.js');
const { dialog } = require('electron').remote;


let session = new Session(Session.select_methods.DIGIT, 200, 200); // TODO: OPTIONS variables

document.getElementsByTagName("main")[0].addEventListener("click", (event) => {
    session.selected_coords = []
});

// * Menu buttons *
document.getElementById("check-btn").addEventListener("click", check_button_click);
document.getElementById("clear-btn").addEventListener("click", clear_button_click);
document.getElementById("reset-btn").addEventListener("click", reset_button_click);
document.getElementById("exit-btn").addEventListener("click", () => {
    window.close();
});

// * Left panel buttons *
document.getElementById("undo-btn").addEventListener("click", undo_button_click);
document.getElementById("redo-btn").addEventListener("click", redo_button_click);

document.getElementById("mode-note").addEventListener("click", (event) => {
    if (session.MODE !== Session.mods.NOTE) {
        session.MODE = Session.mods.NOTE;
    } else {
        event.target.checked = false;
        session.MODE = Session.mods.NORMAL;
    }
});
document.getElementById("mode-color").addEventListener("click", (event) => {
    if (session.MODE !== Session.mods.COLOR) {
        session.MODE = Session.mods.COLOR;
    } else {
        event.target.checked = false;
        session.MODE = Session.mods.COLOR;
    }
});


// * Create table 9x9 for game-field *
let table = document.createElement("table");
for (let i = 0; i < 9; i++) {
    let row = table.insertRow(i);
    for (let j = 0; j < 9; j++) {
        let cell = row.insertCell(j);

        let button = document.createElement("button");
        button.addEventListener("click", (event) => {
            let col_idx = event.target.parentElement.cellIndex;
            let row_idx = event.target.parentElement.parentElement.rowIndex; 
            
            game_field_click(row_idx, col_idx, event.target);
        });
        
        if (session.SELECT_METHOD === Session.select_methods.COORDS) {
            button.addEventListener("mouseenter", (event) => {
                let col_idx = event.target.parentElement.cellIndex;
                let row_idx = event.target.parentElement.parentElement.rowIndex; 
                
                if ( !session.selected_coords.includes({ "x":row_idx, "y":col_idx }) ) {
                    session.selected_coords.push({ "x":row_idx, "y":col_idx })
                }
            });
        }
        cell.appendChild(button)
    }
}

const field = document.getElementById("game-field");
field.appendChild(table);


// * Create right control panel 9x1 *
const panel = document.getElementById("right-controls")
for (let i = 0; i < 10; i++) {
    let radio_div = document.createElement("div")
    radio_div.setAttribute("class", "radio-btn")
    radio_div.setAttribute("id", `radio-btn-${i !== 9 ? i+1 : 0}`)
    
    let radio = document.createElement("input");
    radio.setAttribute("type", "radio")
    radio.setAttribute("name", "digit")
    radio.setAttribute("id", `digit-${i !== 9 ? i+1 : 0}`)
    radio.setAttribute("value", `${i !== 9 ? i+1 : 0}`)
    
    let label = document.createElement("label")
    label.setAttribute("for", `digit-${i !== 9 ? i+1 : 0}`)
    label.textContent = `${i !== 9 ? i+1 : " "}`

    radio_div.appendChild(radio)
    radio_div.appendChild(label)

    // TODO: if (session.SELECT_METHOD === Session.select_methods.COORDS)
    if (session.SELECT_METHOD === Session.select_methods.DIGIT) {
        radio.addEventListener("click", (event) => {
                if (session.selected_digit == event.target.value) {
                    event.target.checked = false;
                    session.selected_digit = 0;
                }
        });
        radio.addEventListener("change", (event) => {
            session.selected_digit = Number(event.target.value);
        });
    } else {
        radio.addEventListener("click", (event) => {
            event.target.checked = false;
            // TODO: Handler for {SELECT_METHOD: COORDS}
    });
    }

    panel.appendChild(radio_div)
}


function game_field_click(x, y) {
    if (session.MODE === Session.mods.NORMAL) {
        if (session.SELECT_METHOD === Session.select_methods.DIGIT) {    
            let curr_digit = Number(table.rows[x].cells[y].getElementsByTagName('button')[0].textContent)
            ipcRenderer.once("guess_status", (event, result) => {
                if (result) {
                    session.undo_history.push(
                        Session.create_history_object(
                            Session.actions.PLACE_DIGIT, 
                            {"x":x, "y":y},
                            curr_digit
                    ));
                }
            });
            ipcRenderer.send("guess", {
                coords: {
                    "x": x,
                    "y": y
                },
                digit: session.selected_digit,
                autocheck: false // TODO: OPTIONS variable
            });
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


function check_button_click() {
    ipcRenderer.invoke("isfull") 
    .then ((isfull) => {
        if (isfull) {
            ipcRenderer.invoke("check")
            .then ((result) => {
                if (result) {
                    stopStopWatch(sw);
                }
                console.log(result ? "OK!" : "Wrong!");
                // * Messagebox on check click *
                let options  = {
                    buttons: ["OK"]
                }
                if (result) {
                    options.message = `Solved! Your time: ${timeCurrent}`;
                } else {
                    options.message = "Wrong!"
                }
                dialog.showMessageBox(options)
            })
        }
    })
}


function clear_button_click() {
    ipcRenderer.send("clear")
    ipcRenderer.once("clear-response", (event, history_data) => {
        // [[[x, y], d], ...] => [{"coords": {"x": x, "y": y}, "digit": d}, ...]
        let structured_data = history_data.map(el => Session.create_history_object(Session.actions.PLACE_DIGIT, {"x": el[0][0], "y": el[0][1]}, el[1]))
        session.undo_history.push(structured_data)
    })
}


function reset_button_click() {
    ipcRenderer.send("reset")
    // TODO: reset table classes
    session = new Session(Session.select_methods.DIGIT, 200, 200);
    sw = resetStopWatch()
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
                ipcRenderer.send("guess", {
                    coords: action.coords,
                    digit: action.digit,
                    autocheck: false
                });
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
                ipcRenderer.send("guess", {
                    coords: action.coords,
                    digit: action.digit,
                    autocheck: false
                });
            }
    }
}

function redo_button_click() {
    if (session.redo_history.length) {
        let action = session.redo_history.pop()
        let curr_digit = Number(table.rows[action.coords["x"]].cells[action.coords["y"]].getElementsByTagName('button')[0].textContent)
    
        session.undo_history.push(
            Session.create_history_object(
                Session.actions.PLACE_DIGIT, 
                action.coords,
                curr_digit 
        ));
        if (action.type === Session.actions.PLACE_DIGIT) {
            ipcRenderer.send("guess", {
                coords: action.coords,
                digit: action.digit,
                autocheck: false
            });
        }
    }
}


// * Update box *
ipcRenderer.on("update", (event, args) => {
    for (let i = 0, row; row = table.rows[i]; i++) {
        for (let j = 0, cell; cell = row.cells[j]; j++) {
            if (args[i][j] !== 0) {
                cell.getElementsByTagName('button')[0].textContent = args[i][j];
            } else {
                cell.getElementsByTagName('button')[0].textContent = '';
            }
        }  
    }
});

ipcRenderer.on("init", (event, args) => {
    for (let i = 0, row; row = table.rows[i]; i++) {
        for (let j = 0, cell; cell = row.cells[j]; j++) {
            let elem = cell.getElementsByTagName('button')[0];
            // Clear all classes from button
            elem.classList.forEach(elem_class => elem.classList.remove(elem_class))
            if (args[i][j] !== 0) {
                elem.classList.add('initial');
                elem.textContent = args[i][j];
            } else {
                elem.classList.add('normal');
                elem.textContent = '';
            }
        }  
    }
});

