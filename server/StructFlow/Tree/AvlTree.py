import pygame
import cv2
import numpy as np
import threading
import sys
import random
from flask import Flask, Response, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  


pygame.init()
window_width, window_height = 800, 800
screen = pygame.Surface((window_width, window_height))
clock = pygame.time.Clock()

columns, rows = 25, 25
box_width = window_width // columns
box_height = window_height // rows
grid = []
queue = []
path = []
output_frame = None
lock = threading.Lock()

searching = False 

class Box:
    def __init__(self, i, j):
        self.x = i
        self.y = j
        self.start = False
        self.wall = False
        self.target = False
        self.queued = False
        self.visited = False
        self.neighbours = []
        self.prior = None

    def draw(self, win, color):
        pygame.draw.rect(win, color, (self.x * box_width, self.y * box_height, box_width - 2, box_height - 2))

    def set_neighbours(self):
        if self.x > 0:
            self.neighbours.append(grid[self.x - 1][self.y])
        if self.x < columns - 1:
            self.neighbours.append(grid[self.x + 1][self.y])
        if self.y > 0:
            self.neighbours.append(grid[self.x][self.y - 1])
        if self.y < rows - 1:
            self.neighbours.append(grid[self.x][self.y + 1])

for i in range(columns):
    arr = []
    for j in range(rows):
        arr.append(Box(i, j))
    grid.append(arr)

for i in range(columns):
    for j in range(rows):
        grid[i][j].set_neighbours()

start_box = grid[random.randint(0, 24)][random.randint(0, 24)]
start_box.start = True
start_box.visited = True
queue.append(start_box)

@app.route('/click', methods=['POST'])
def click():
    data = request.get_json()
    x, y, button = data["x"], data["y"], data["button"]
    
    grid_x = int(x // box_width)
    grid_y = int(y // box_height)

    if 0 <= grid_x < columns and 0 <= grid_y < rows:
        if button == "left":
            grid[grid_x][grid_y].wall = True
        elif button == "right":
            grid[grid_x][grid_y].target = True

    return jsonify({"status": "clicked", "x": grid_x, "y": grid_y})

@app.route('/start_search', methods=['POST'])
def start_search():
    global searching
    searching = True 
    return jsonify({"status": "search started"})

def path_finder():
    global output_frame, lock, searching
    target_box = None

    running = True
    while running:
        screen.fill((0, 0, 0))

        if searching:
            if len(queue) > 0:
                current_box = queue.pop(0)
                current_box.visited = True
                if current_box.target:
                    searching = False
                    while current_box.prior != start_box:
                        path.append(current_box.prior)
                        current_box = current_box.prior
                else:
                    for neighbour in current_box.neighbours:
                        if not neighbour.queued and not neighbour.wall:
                            neighbour.queued = True
                            neighbour.prior = current_box
                            queue.append(neighbour)
            else:
                searching = False

        for i in range(columns):
            for j in range(rows):
                box = grid[i][j]
                box.draw(screen, (100, 100, 100))
                if box.queued:
                    box.draw(screen, (200, 0, 0))
                if box.visited:
                    box.draw(screen, (0, 200, 0))
                if box in path:
                    box.draw(screen, (0, 0, 200))
                if box.start:
                    box.draw(screen, (0, 200, 200))
                if box.wall:
                    box.draw(screen, (10, 10, 10))
                if box.target:
                    box.draw(screen, (200, 200, 0))

        frame = pygame.surfarray.array3d(screen)
        frame = np.rot90(frame)
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

        with lock:
            output_frame = frame.copy()

        clock.tick(30)

@app.route('/video_feed')
def video_feed():
    def generate():
        global output_frame, lock
        while True:
            with lock:
                if output_frame is None:
                    continue
                _, buffer = cv2.imencode(".jpg", output_frame)
                frame = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")

if __name__ == "__main__":
    threading.Thread(target=path_finder, daemon=True).start()
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
