import pygame
import cv2
import numpy as np
import threading
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import heapq

# אתחול Flask
app_graph = Flask(__name__)
CORS(app_graph)

# אתחול Pygame
pygame.init()
WIDTH, HEIGHT = 700, 650
screen = pygame.Surface((WIDTH, HEIGHT))
clock = pygame.time.Clock()

# משתנים גלובליים
output_frame = None
lock = threading.Lock()
circles = []  # משתנה שיאחסן את העיגולים שנוצרו
CIRCLE_RADIUS = 20  # רדיוס העיגול
MIN_DISTANCE = CIRCLE_RADIUS * 2  # המרחק המינימלי בין עיגולים

# מחלקת גרף
class Graph:
    def __init__(self):
        self.nodes = {}
        self.edges = []

    def add_node(self, name, pos):
        self.nodes[name] = pos

    def add_edge(self, node1, node2, weight):
        if node1 in self.nodes and node2 in self.nodes:
            self.edges.append((node1, node2, weight))

    def dijkstra(self, start):
        shortest_paths = {node: float('inf') for node in self.nodes}
        shortest_paths[start] = 0
        priority_queue = [(0, start)]
        previous_nodes = {}

        while priority_queue:
            current_distance, current_node = heapq.heappop(priority_queue)

            if current_distance > shortest_paths[current_node]:
                continue

            for neighbor, weight in [(n2, w) for n1, n2, w in self.edges if n1 == current_node] + \
                                    [(n1, w) for n1, n2, w in self.edges if n2 == current_node]:
                distance = current_distance + weight
                if distance < shortest_paths[neighbor]:
                    shortest_paths[neighbor] = distance
                    previous_nodes[neighbor] = current_node
                    heapq.heappush(priority_queue, (distance, neighbor))

        return shortest_paths, previous_nodes

graph = Graph()

@app_graph.route('/add_node', methods=['POST'])
def add_node():
    data = request.get_json()
    name, x, y = data["name"], data["x"], data["y"]
    graph.add_node(name, (x, y))
    return jsonify({"status": "Node added", "node": name})

@app_graph.route('/add_edge', methods=['POST'])
def add_edge():
    data = request.get_json()
    node1, node2, weight = data["node1"], data["node2"], data["weight"]
    graph.add_edge(node1, node2, weight)
    return jsonify({"status": "Edge added", "edge": (node1, node2, weight)})

@app_graph.route('/get_graph', methods=['GET'])
def get_graph():
    return jsonify({"nodes": graph.nodes, "edges": graph.edges})

@app_graph.route('/dijkstra', methods=['POST'])
def find_shortest_path():
    data = request.get_json()
    start_node = data["start"]
    shortest_paths, previous_nodes = graph.dijkstra(start_node)
    return jsonify({"shortest_paths": shortest_paths, "previous_nodes": previous_nodes})

@app_graph.route('/mouse_click', methods=['POST'])
def mouse_click():
    data = request.get_json()
    
    # Get the relative coordinates (floats between 0 and 1)
    rel_x = data.get('x')
    rel_y = data.get('y')
    print("Relative coordinates received:", rel_x, rel_y)
    
    if rel_x is not None and rel_y is not None:
        # Convert relative coordinates to absolute coordinates (pixels)
        abs_x = int(float(rel_x) * 700)
        abs_y = int(float(rel_y) * 650)
        print(f"Converted absolute coordinates: x={abs_x}, y={abs_y}")
        
        # Check if the click is too close to any existing circle
        for (cx, cy) in circles:
            distance = ((abs_x - cx) ** 2 + (abs_y - cy) ** 2) ** 0.5  # Calculate distance between click and circle center
            if distance < MIN_DISTANCE:
                return jsonify({"message": "Click is too close to an existing circle, no new circle added."}), 200

        # Add the new circle to the list of circles if no overlap
        circles.append((abs_x, abs_y))
        return jsonify({"x": abs_x, "y": abs_y})
    else:
        return jsonify({"error": "x and y values are required"}), 400

def render_graph():
    global output_frame, lock
    while True:
        screen.fill((255, 255, 255))

        # ציור הצמתים והקווים
        for node1, node2, weight in graph.edges:
            pygame.draw.line(screen, (0, 0, 0), graph.nodes[node1], graph.nodes[node2], 2)
            mid_x = (graph.nodes[node1][0] + graph.nodes[node2][0]) // 2
            mid_y = (graph.nodes[node1][1] + graph.nodes[node2][1]) // 2
            font = pygame.font.Font(None, 25)
            text = font.render(str(weight), True, (0, 0, 0))
            screen.blit(text, (mid_x, mid_y))

        # ציור צמתים
        for node, pos in graph.nodes.items():
            pygame.draw.circle(screen, (0, 0, 255), pos, 20)
            pygame.draw.circle(screen, (0, 0, 0), pos, 21, 2)

        # ציור כל העיגולים שנשמרו
        for (x, y) in circles:
            pygame.draw.circle(screen, (0, 0, 255), (x, y), CIRCLE_RADIUS)

        # יצירת תמונת וידאו
        frame = pygame.surfarray.array3d(screen)
        frame = np.rot90(frame)
        frame = cv2.flip(frame, 0)
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

        with lock:
            output_frame = frame.copy()

@app_graph.route('/video_feed_Graph')
def video_feed_Graph():
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