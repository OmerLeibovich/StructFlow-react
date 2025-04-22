import multiprocessing
import multiprocessing.process
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


server_process = None

@app.route('/set_application', methods=['POST'])
def set_application():
    global server_process
    data = request.get_json()
    print("Received data:", data)
    app_name = data.get("application", "")
    run_tree = False
    run_graph = False
    run_linkedlist = False
    run_double_linkedlist = False

    match app_name:
        case "tree":
            run_tree = True
        case "graph":
            run_graph = True
        case "linkedlist":
            run_linkedlist = True
        case "doublelinkedlist":
            run_double_linkedlist = True
        case _:
            return jsonify({"error": "Invalid application"}), 400

   
    if server_process is not None:
        server_process.terminate()
        server_process.join()
    

    if run_tree:
        server_process = multiprocessing.Process(target=run_tree_server)
        server_process.start()
    elif run_graph:
        server_process = multiprocessing.Process(target=run_graph_server)
        server_process.start()
    elif run_linkedlist:
        server_process = multiprocessing.Process(target=run_linkedlist_server)
        server_process.start()
    elif run_double_linkedlist:
        server_process = multiprocessing.Process(target=run_double_linkedlist_server)
        server_process.start()

    return jsonify({"message": f"{app_name} server started"})

def run_tree_server():
    from StructFlow.Tree.AvlTree import app_tree, render_tree
    threading.Thread(target=render_tree, daemon=True).start()
    app_tree.run(host="0.0.0.0", port=5000, debug=False, threaded=True)

def run_graph_server():
    from StructFlow.Graph.Graph import app_graph, render_graph
    threading.Thread(target=render_graph, daemon=True).start()
    app_graph.run(host="0.0.0.0", port=5001, debug=False, threaded=True)

def run_linkedlist_server():
    from StructFlow.Structures.LinkedList import app_LinkedList,render_linkedlist
    threading.Thread(target=render_linkedlist, daemon=True).start()
    app_LinkedList.run(host="0.0.0.0", port = 5002 , debug = False ,  threaded=True)


def run_double_linkedlist_server():
    from StructFlow.Structures.DoubleLinkedList import app_Double_LinkedList,render_Double_linkedlist
    threading.Thread(target=render_Double_linkedlist, daemon=True).start()
    app_Double_LinkedList.run(host="0.0.0.0", port = 5003 , debug = False ,  threaded=True)



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000, debug=False, threaded=True)
