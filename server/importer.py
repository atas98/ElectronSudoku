import json
import requests
import numpy as np


def from_json(json_str):
    obj = json.loads(json_str)
    box = np.zeros(shape=(9, 9), dtype=np.int8)
    for square in obj['squares']:
        box[square['x'], square['y']] = square['value']
    return box


def generate(level, size=9):
    if size not in [4, 9] or level not in [1, 2, 3]:
        raise ValueError
    query = f"http://www.cs.utep.edu/cheon/ws/sudoku/new/?size={size}&level={level}"
    response = requests.get(query)
    if not response:
        raise RuntimeError(response.status_code)
    return from_json(response.content)


if __name__ == "__main__":
    print(from_json(generate(3)))
