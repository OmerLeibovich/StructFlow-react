import threading
import os
import signal
from StructFlow.Tree.AvlTree import app_tree, render_tree
from StructFlow.Graph.Graph import app_graph, render_graph
from flask import Flask, request, jsonify
from flask_cors import CORS

# יצירת שרת Flask מרכזי
app = Flask(__name__)
CORS(app)

run_tree = False
run_graph = False
server_thread = None

@app.route('/set_application', methods=['POST'])
def set_application():
    global run_tree, run_graph, server_thread

    run_tree = False
    run_graph = False
    data = request.get_json()
    print("Received data:", data)
    app_name = data.get("application", "")

    print(f"run_tree: {run_tree}, run_graph: {run_graph}")

    if app_name == "tree":
        run_tree = True
        run_graph = False
    elif app_name == "graph":
        run_tree = False
        run_graph = True
    else:
        return jsonify({"error": "Invalid application"}), 400

    start_servers()  

    return jsonify({"message": f"{app_name} server started"})

def start_servers():
    global server_thread
    if run_tree:
        server_thread = threading.Thread(target=render_tree, daemon=True)
        server_thread.start()
        app_tree.run(host="0.0.0.0", port=5000, debug=False, threaded=True) 
    elif run_graph:
        server_thread = threading.Thread(target=render_graph, daemon=True)
        server_thread.start()
        app_graph.run(host="0.0.0.0", port=5001, debug=False, threaded=True) 

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000, debug=False, threaded=True)
