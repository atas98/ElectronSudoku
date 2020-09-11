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
        button.addEventListener("click", game_field_click);
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


init_box()






