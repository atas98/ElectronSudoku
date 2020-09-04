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

        self.auto_check = auto
        self.full = False

    def guess(self, coords, digit):
        if digit < 0 or digit > 9:
            return False
        if coords[0] > 8 or coords[0] < 0 or coords[1] > 8 or coords[1] < 0:
            return False

        if self.initial_box[coords] != 0:
            return False

        self.box[coords] = digit

        if self.auto_check:
            if not check(self.box):
                self.box[coords] = 0
                return False

        self.full = isfull(self.box)
        return True

    def check(self):
        return check(self.box)

    def clear(self):
        diff = self.box-self.initial_box
        self.box = self.initial_box.copy()
        return [el for el in np.ndenumerate(diff.astype(np.int)) if el[1] != 0]


if __name__ == "__main__":
    from importer import generate
    game = SudokuGame(generate(2))
    print(game.box)
    game = SudokuGame(generate(2))
    print(game.box)
    # for i in range(9):
    #     for j in range(9):
    #         game.guess((i, j), 1)
    # log = game.clear()
    # log_json = json.dumps(log, cls=NumpyEncoder)
    # print(type(log[0][1]))
    # print(log_json)
