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
        REMOVE_DIGIT: 2,  // Remove digit from field 
        PLACE_NOTE: 3,    // Place note into field 
        REMOVE_NOTE: 4    // Remove note into field
    });

    static create_history_object(action, coords, digit) {
        return new Dict({
            "action": action,
            "coords": coords,
            "digit": digit
        });
    }

    constructor(sel_method) {
        this.MODE = this.constructor.mods.NORMAL;
        this.SELECT_METHOD = sel_method | this.constructor.select_methods.DIGIT;
      
        this.selected_digit = 0;
        this.selected_coords = [[]];

        this.undo_history = [];
        this.redo_history = [];
    }

}

module.exports = Session