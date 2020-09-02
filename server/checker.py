import numpy as np


def check_slice(line):
    return len(line[line != 0].flatten()) == len(np.unique(line[line != 0]))

def check(box, size=3):
    for row in box:
        if not check_slice(row):
            return False
    for col in box.T:
        if not check_slice(col):
            return False
    for xn in range(3):
        for yn in range(3):
            if not check_slice(box[3*xn:3*xn+3, 3*yn:3*yn+3]):
                return False

    return True

def isfull(box):
    return len(box[box == 0]) == 0
