const {ipcRenderer} = require('electron')
const Session = require('./session.js');

let session = new Session(Session.select_methods.DIGIT, 200, 200); // TODO: Fix magic numbers

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
// TODO: Events for mode buttons

// * Create table 9x9 for game-field *
let table = document.createElement("table");
for (let i = 0; i < 9; i++) {
    let row = table.insertRow(i);
    for (let j = 0; j < 9; j++) {
        let cell = row.insertCell(j);

        let button = document.createElement("button");
        button.addEventListener("click", function onclick(event) {
            let col_idx = event.target.parentElement.cellIndex;
            let row_idx = event.target.parentElement.parentElement.rowIndex; 
            
            game_field_click(row_idx, col_idx, event.target);
        });

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
    radio.addEventListener("click", (event) => {
        if (session.selected_digit == event.target.value) {
            event.target.checked = false
            session.selected_digit = 0
        }
        // console.log(event.target.value)
    });
    radio.addEventListener("change", (event) => {
        session.selected_digit = Number(event.target.value)
        // console.log(session.selected_digit)
    });

    panel.appendChild(radio_div)
}


function game_field_click(x, y) {
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
    // TODO: if (session.SELECT_METHOD === Session.select_methods.COORDS)
    // Handler for {SELECT_METHOD: DIGIT}
    ipcRenderer.send("guess", {
        coords: {
            "x": x,
            "y": y
        },
        digit: session.selected_digit
    });
    // TODO: Possible autocheck
    // TODO: Note
    // TODO: Color

    console.log(session.undo_history)
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
                console.log(result ? "OK!" : "Wrong!"); // TODO: MsgBox or smth
            })
        }
    })
}


function clear_button_click() {
    ipcRenderer.send("clear")
}


function reset_button_click() {
    ipcRenderer.send("reset")
    session = new Session(Session.select_methods.DIGIT, 200, 200);
    sw = resetStopWatch()
}


function undo_button_click() {
    if (session.undo_history.length) {
        let action = session.undo_history.pop()
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
                digit: action.digit
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
                digit: action.digit
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

