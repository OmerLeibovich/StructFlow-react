import pygame
import cv2
import threading
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import heapq
import random
from StructFlow.Screen import *



app_graph = Flask(__name__)
CORS(app_graph)


pygame.init()
clock = pygame.time.Clock()


output_frame = None
lock = threading.Lock()
current_line_start = None   
linesDistance = []
count = 1
dijkstra_path_edges = [] 
rendering_active = True
random_Activity = False


class Graph:
    def __init__(self):
        self.nodes = []
        self.edges = []

    def add_node(self, name, pos):
        self.nodes[name] = pos

    def add_edge(self, node1, node2, weight):
        if node1 in self.nodes and node2 in self.nodes:
            self.edges.append((node1, node2, weight))

    def dijkstra_all(self,start, nodes, edges):

        graph_adj = {node: [] for node in nodes}
        for edge in edges:
            n1, n2, weight = edge
            graph_adj[n1].append((n2, weight, edge))
            graph_adj[n2].append((n1, weight, edge))
        
        import heapq
        dist = {node: float('inf') for node in nodes}
        prev = {node: None for node in nodes}
        edge_used = {node: None for node in nodes}
        dist[start] = 0
        pq = [(0, start)]
        
        while pq:
            d, u = heapq.heappop(pq)
            if d > dist[u]:
                continue
            for v, weight, used_edge in graph_adj[u]:
                alt = d + weight
                if alt < dist[v]:
                    dist[v] = alt
                    prev[v] = u
                    edge_used[v] = used_edge
                    heapq.heappush(pq, (alt, v))
        
        return dist, prev, edge_used

    


graph = Graph()


@app_graph.route('/left_mouse_click', methods=['POST'])
def left_mouse_click():
    global random_Activity
    if (not random_Activity):
        global count
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
            for circle in graph.nodes:
                    cx, cy = circle[:2]
                    distance = ((abs_x - cx) ** 2 + (abs_y - cy) ** 2) ** 0.5
                    if distance < MIN_DISTANCE:
                        return jsonify({"message": "Click is too close to an existing circle, no new circle added."}), 200


            # Add the new circle to the list of circles if no overlap
            graph.nodes.append((abs_x, abs_y) + (count,))

            count+=1
            return jsonify({"x": abs_x, "y": abs_y})
        else:
            return jsonify({"error": "x and y values are required"}), 400
    else:
        return jsonify({"error": "You can't add a new point when random is active."}), 400

    

@app_graph.route('/right_mouse_click', methods=["POST"])
def right_mouse_click():
    global current_line_start
    data = request.get_json()
    phase = data.get("phase")
    points = data.get("points")
    
    if not points:
        return jsonify({"error": "No points provided"}), 400

    if isinstance(points, dict):
        points = [points]

    if phase == "start":
        current_line_start = points[0]
        return jsonify({"status": "Starting points received"}), 200
    elif phase == "end":
        end_point = points[0]
        if current_line_start is not None:
            if point_in_circle(current_line_start) and point_in_circle(end_point):
                circle_start = get_circle_center(current_line_start)
                circle_end = get_circle_center(end_point)
                if circle_start != circle_end:
                    exists = any(
                        (edge[:2] == (circle_start, circle_end) or edge[:2] == (circle_end, circle_start))
                        for edge in graph.edges
                    )
                    if not exists:
                        graph.edges.append((circle_start, circle_end))
                        print("Line added:", circle_start, circle_end)
                    else:
                        print("Line not added: line already exists between these circles.")
                else:
                    print("Line not added: cannot connect a circle to itself.")
            else:
                print("Line not added: starting or ending point is not within a circle.")
            current_line_start = None
        return jsonify({"status": "Ending points received"}), 200
    else:
        return jsonify({"error": "Invalid phase value"}), 400


    
@app_graph.route('/random_numbers_tolines', methods=["GET"])
def random_numbers_tolines():
    global linesDistance,dijkstra_path_edges,random_Activity
    random_Activity = True
    dijkstra_path_edges = []
    linesDistance = []
    for i in range(len(graph.edges)):
        random_num = random.randint(1, 100) 
        graph.edges[i] = graph.edges[i][:2] + (random_num,)
        linesDistance.append(random_num)
    linesDistance_sorted = sorted(linesDistance)
    return jsonify({"LinesDis": linesDistance_sorted})


@app_graph.route('/get_graph',methods = ["GET"])
def get_graph():
    global linesDistance
    return jsonify ({"distanses":sorted(linesDistance)})


@app_graph.route('/Dijkstra_algo', methods=["POST"])
def Dijkstra_algo():
    data = request.get_json()
    print("Received JSON:", data)

    start_key = int(data["key"])



    start_circle = None
    for circle in graph.nodes:
        if circle[-1] == start_key:
            start_circle = circle
            break
    if start_circle is None:
        print("1")
        return jsonify({"error": "Invalid start key"}), 400


    start_node = None
    for node in graph.nodes:
    
        print(node)
        if node[0] == start_circle[0] and node[1] == start_circle[1]:
            start_node = node
            break

    if not start_node:
        print("2")
        return jsonify({"error": "Start node not found in graph"}), 400

    start_node = (start_circle[0], start_circle[1])
    nodes_for_dijkstra = [(circle[0], circle[1]) for circle in graph.nodes]
    shortest_paths, previous_nodes, edge_used = graph.dijkstra_all(start_node, nodes_for_dijkstra, graph.edges)

    key_to_distance = {}

    for circle in graph.nodes:
        node_coords = (circle[0], circle[1])
        key = circle[-1]
        distance = shortest_paths.get(node_coords)
        if distance is not None and distance != float('inf'):
            key_to_distance[str(key)] = distance



    start_key_str = str(start_key)
    if start_key_str not in key_to_distance:
        key_to_distance[start_key_str] = 0


    if len(key_to_distance) <= 1:
        return jsonify({"error": "Selected node is isolated."}), 400
    




    global dijkstra_path_edges
    dijkstra_path_edges = list({edge for edge in edge_used.values() if edge is not None})
    shortest_paths_str = {
    str(k): (v if v != float('inf') else None)
    for k, v in shortest_paths.items()
}
    previous_nodes_str = {str(k): str(v) if v is not None else None for k, v in previous_nodes.items()}

    return jsonify({
        "Shortest_paths": shortest_paths_str,
        "Previous_nodes": previous_nodes_str,
        "Key_Distances": key_to_distance,
    })

@app_graph.route("/reset" , methods = ["GET"])
def reset():
    global current_line_start,linesDistance,count,dijkstra_path_edges,random_Activity
    graph.nodes = []
    graph.edges = []
    current_line_start = None   
    linesDistance = []
    count = 1
    dijkstra_path_edges = []
    random_Activity = False

    
    return jsonify({"message": "All was reset"}), 200


    


def point_in_circle(point):
    x = int(point["x"])
    y = int(point["y"])
    for circle in graph.nodes:
        cx, cy = circle[:2]
        distance = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
        if distance <= CIRCLE_RADIUS:
            return True
    return False

def get_circle_center(point):
    x = int(point["x"])
    y = int(point["y"])
    for circle in graph.nodes:
        cx, cy = circle[:2]
        distance = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
        if distance <= CIRCLE_RADIUS:
            return (cx, cy)
    return (x, y)

def render_graph():
    global linesDistance, output_frame, lock, dijkstra_path_edges
    while rendering_active:
        clear_screen()


        for edge in graph.edges:
            edge_to_check = edge if len(edge) == 2 else edge[:2]
            if dijkstra_path_edges and any(
                ((e[0] == edge_to_check[0] and e[1] == edge_to_check[1]) or
                 (e[0] == edge_to_check[1] and e[1] == edge_to_check[0]))
                for e in dijkstra_path_edges
            ):
                edge_color = (0, 255, 0)  
            else:
                edge_color = (0, 0, 0)
            pygame.draw.line(screen, edge_color, edge[0], edge[1], 6)


        for circle in graph.nodes:
            x, y, num = circle
            pygame.draw.circle(screen, (173, 216, 230), (x, y), CIRCLE_RADIUS)
            text = font.render(str(num), True, (255, 0 , 0))
            text_rect = text.get_rect(center=(x, y))
            screen.blit(text, text_rect)


        if linesDistance:
            for line in graph.edges:
                if len(line) >= 3:
                    start, end, weight = line
                    mid_x = (start[0] + end[0]) // 2
                    mid_y = (start[1] + end[1]) // 2
                    text = font.render(str(weight), True, (0, 0, 0))
                    text_rect = text.get_rect(center=(mid_x, mid_y))
                    pygame.draw.rect(screen, (255, 255, 0), text_rect.inflate(10, 10))
                    screen.blit(text, text_rect)
        
        with lock:
            output_frame = get_frame().copy()

        clock.tick(30)

         




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