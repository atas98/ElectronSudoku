const {ipcRenderer} = require('electron')
const Session = require('./session.js');

let session = new Session(Session.select_methods.DIGIT);

document.getElementById("check-btn").addEventListener("click", check_button_click);
document.getElementById("exit-btn").addEventListener("click", () => {
    window.close();
});


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
}


function check_button_click() {
    ipcRenderer.invoke("check")
        .then((result) => {
            console.log(result ? "OK!" : "Wrong!")
        });
}


// * Update box *
ipcRenderer.on("update", (event, args) => {
    for (let i = 0, row; row = table.rows[i]; i++) {
        for (let j = 0, cell; cell = row.cells[j]; j++) {
            if (args[i][j] !== 0) {
                cell.textContent = args[i][j];
            }
        }  
    }
});

