'strict'
class Session {
    static select_methods = Object.freeze({
        DIGIT: 1, 
        COORDS: 2
    });
    
    static mods = Object.freeze({
        NORMAL: 1, 
        NOTE: 2,
        COLOR: 3
    });
    
    static actions = Object.freeze({
        PLACE_DIGIT: 1,   // Place digit into field
        PLACE_NOTE: 2,    // Place note into field
        REMOVE_NOTE: 2,    // Place note into field
        Clear: 3
    });

    static create_history_object(type, coords, digit) {
        return {
            "type": type,
            "coords": coords,
            "digit": digit
        };
    }

    constructor(sel_method) {
        this.MODE = this.constructor.mods.NORMAL;
        this.SELECT_METHOD = sel_method | this.constructor.select_methods.DIGIT;
      
        this.selected_digit = 0;
        this.selected_coords = [[]];

        // TODO: Restrict max length of the history 
        this.undo_history = [];
        this.redo_history = [];
    }
}

module.exports = Session