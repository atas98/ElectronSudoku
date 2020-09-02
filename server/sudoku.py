import numpy as np
from collections import deque
from checker import check, isfull


class SudokuGame:
    def __init__(self, box, auto=False):
        if not isinstance(box, np.ndarray):
            raise TypeError("Wrong box type!")
        else:
            self.initial_box = box.copy()
            self.box = box.copy()

        # initializing notes grid (9x9) with empty lists
        self.notes = np.empty((9, 9), dtype=object)
        for i in np.ndindex(self.notes.shape):
            self.notes[i] = []

        self._undo_buffer = deque()
        self._redo_buffer = deque()

        self.auto_check = auto
        self.full = False

    def guess(self, coords, digit):
        if digit < 1 or digit > 9:
            return False
        if coords[0] > 8 or coords[0] < 0 or coords[1] > 8 or coords[1] < 0:
            return False

        if self.initial_box[coords] != 0:
            return False

        self.box[coords] = digit
        self._undo_buffer.append({})

        if check:
            if not check(self.box):
                self.box[coords] = 0
                return False

        self.full = isfull(self.box)
        return True

    def note(self, coords, digit):
        if digit not in self.notes[coords]:
            self.notes[coords].append(digit)
            return True
        else:
            return False

    def check(self):
        return check(self.box)

    def reset(self):
        self.box = self.initial_box.copy()
        # initializing notes grid (9x9) with empty lists
        self.notes = np.empty((9, 9), dtype=object)
        for i in np.ndindex(self.notes.shape):
            self.notes[i] = []

        self._undo_buffer = deque()
        self._redo_buffer = deque()

    def undo(self):
        # TODO: Implement undo feature
        # TODO: Save actions to history stack
        pass

    def redo(self):
        # TODO: Implement redo feature
        # TODO: Save undo actions to history stack
        pass

    def clear(self):
        # TODO: save state in undo_buffer
        self.box = self.initial_box.copy()
        return True


if __name__ == "__main__":
    from importer import generate
    game = SudokuGame(generate(2))
    print(game.guess((3, 2), 9))
    print(game.full)
    print(game.note((3, 3), 9))
    print(game.notes)
    game.clear()
    game.reset()
    print(game.check())
    print(game.box)
