from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app_graph = Flask(__name__)
CORS(app_graph)

# קבועים
CIRCLE_RADIUS = 25
MIN_DISTANCE = 50

current_line_start = None
linesDistance = []
count = 1
dijkstra_path_edges = []
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
    

def find_node_at_point(point):
    x, y = int(point["x"]), int(point["y"])
    for circle in graph.nodes:
        cx, cy = circle[:2]
        distance = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
        if distance <= CIRCLE_RADIUS:
            return (cx, cy)  
    return None


    


graph = Graph()


@app_graph.route("/graph_data", methods=["GET"])
def get_graph_data():
    return jsonify({
        "nodes": graph.nodes,
        "edges": graph.edges,
        "highlighted_edges": dijkstra_path_edges
    }), 200


@app_graph.route('/left_mouse_click', methods=['POST'])
def left_mouse_click():
    global count, random_Activity
    if random_Activity:
        return jsonify({"error": "You can't add a new point when random is active."}), 400

    data = request.get_json()
    rel_x = data.get('x')
    rel_y = data.get('y')

    if rel_x is None or rel_y is None:
        return jsonify({"error": "x and y values are required"}), 400

    abs_x = int(rel_x * 700)
    abs_y = int(rel_y * 650)

    for circle in graph.nodes:
        cx, cy = circle[:2]
        distance = ((abs_x - cx) ** 2 + (abs_y - cy) ** 2) ** 0.5
        if distance < MIN_DISTANCE:
            return jsonify({"message": "Too close to existing node"}), 200

    graph.nodes.append((abs_x, abs_y, count))
    count += 1
    return jsonify({"x": abs_x, "y": abs_y})


@app_graph.route('/right_mouse_click', methods=['POST'])
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
        return jsonify({"status": "Start received"}), 200

    elif phase == "end":
        end_point = points[0]

        if current_line_start is None:
            return jsonify({"error": "Start point missing"}), 400

        start_node = find_node_at_point(current_line_start)
        end_node = find_node_at_point(end_point)

        if not start_node or not end_node or start_node == end_node:
            return jsonify({"error": "Invalid connection"}), 400

        exists = any(
            (edge[:2] == (start_node, end_node) or edge[:2] == (end_node, start_node))
            for edge in graph.edges
        )

        if not exists:
            graph.edges.append((start_node, end_node))
            return jsonify({"status": "Edge added"}), 200
        else:
            return jsonify({"message": "Edge already exists"}), 200

    return jsonify({"error": "Invalid phase"}), 400

@app_graph.route("/randomize_weights", methods=["GET"])
def randomize_weights():
    global graph, linesDistance, random_Activity
    random_Activity = True
    linesDistance.clear()

    new_edges = []
    for (n1, n2) in graph.edges:
        weight = random.randint(1, 20)
        new_edges.append((n1, n2, weight))
        linesDistance.append(weight)
    
    graph.edges = new_edges
    return jsonify({"LinesDis": linesDistance}), 200


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

@app_graph.route('/reset_right_click', methods=['POST'])
def reset_right_click():
    global current_line_start
    current_line_start = None
    return jsonify({"status": "Right-click start reset"}), 200

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


