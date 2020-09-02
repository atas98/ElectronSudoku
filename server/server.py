import sys
sys.path.append("G:\\Dev\\Conda\\envs\\mainenv\\lib\\site-packages\\")
import numpy
import json
import signal
import os

from flask import Flask, request, abort

from sudoku import SudokuGame
from importer import generate

app = Flask(__name__)

@app.route('/guess', methods=['POST'])
def guess_handler():
    if not request.is_json:
        abort(400)
    try:
        coords = tuple(request.json["coords"])
        digit = request.json["digit"]
    except KeyError:
        abort(400)
    return json.dumps(game.guess(coords, digit))

@app.route('/note', methods=['POST'])
def note_handler():
    if not request.is_json:
        abort(400)
    try:
        coords = tuple(request.json["coords"])
        digit = request.json["digit"]
    except KeyError:
        abort(400)
    return json.dumps(game.note(coords, digit))

@app.route('/isfull', methods=['GET'])
def isfull_handler():
    return json.dumps(game.full)

@app.route('/check', methods=['GET'])
def check_handler():
    return json.dumps(game.check())

@app.route('/box', methods=['GET'])
def box_handler():
    return json.dumps(game.box.tolist())

@app.route('/notes', methods=['GET'])
def notes_handler():
    return json.dumps(game.notes.tolist())


def sigterm_handler(_signo, _stack_frame):
    # Raises SystemExit(0):
    os.exit(0)

signal.signal(signal.SIGTERM, sigterm_handler)


if __name__ == "__main__":
    try:
        PORT = sys.argv[1]
    except IndexError:
        PORT = 8000

    try:
        level = int(sys.argv[2])
    except (IndexError, ValueError) as err:
        print(err)
        level = 1
    game = SudokuGame(generate(level))
    app.run(debug=False, port=PORT)
    print("Server started!")
