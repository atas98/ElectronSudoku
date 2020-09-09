from importer import generate
from sudoku import SudokuGame
from flask import Flask, request, abort
import numpy as np
import signal
import json
import sys
import os
# sys.path.append("G:\\Dev\\Conda\\envs\\mainenv\\lib\\site-packages\\")


app = Flask(__name__)


@app.route('/api/sudoku/guess', methods=['POST'])
def guess_handler():
    """[summary]

    Returns:
        Boolean: Returning True if digit was put in box
    """
    if not request.is_json:
        abort(400)
    try:
        coords = tuple(request.json["coords"])
        digit = request.json["digit"]
        autocheck = request.json["autocheck"]
    except KeyError:
        abort(400)
    return json.dumps(game.guess(coords, digit, autocheck))


@app.route('/api/sudoku/clear', methods=['POST'])
def clear_handler():
    return json.dumps(game.clear(), cls=NumpyEncoder)


@app.route('/api/sudoku/reset', methods=['POST'])
def reset_handler():
    if request.is_json:
        try:
            level = request.json["level"]
        except KeyError:
            level = 1
    else:
        level = 1
    game.restart(generate(level))
    return ""


@app.route('/api/sudoku/isfull', methods=['GET'])
def isfull_handler():
    return json.dumps(game.full)


@app.route('/api/sudoku/check', methods=['GET'])
def check_handler():
    return json.dumps(game.check())


@app.route('/api/sudoku/initial_box', methods=['GET'])
def initial_box_handler():
    return json.dumps(game.initial_box, cls=NumpyEncoder)

@app.route('/api/sudoku/box', methods=['GET'])
def box_handler():
    return json.dumps(game.box, cls=NumpyEncoder)


@app.route('/api/status', methods=['GET'])
def status_handler():
    return json.dumps(True)


def sigterm_handler(_signo, _stack_frame):
    # Raises SystemExit(0):
    os.exit(0)


signal.signal(signal.SIGTERM, sigterm_handler)


class NumpyEncoder(json.JSONEncoder):
    """ Special json encoder for numpy types """

    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)


if __name__ == "__main__":
    try:
        PORT = sys.argv[1]
    except IndexError:
        print("Warning: Port parameter is undefined or NaN. Using default value (port=8000)")
        PORT = 8000

    try:
        level = int(sys.argv[2])
    except (IndexError, ValueError) as err:
        print("Warning: Level parameter is undefined or NaN. Using default value (level=1)")
        level = 1

    game = SudokuGame(generate(level))
    app.run(debug=False, port=PORT)
    print("Server started!")
