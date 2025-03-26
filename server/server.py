import multiprocessing
import threading
from StructFlow.Tree.AvlTree import app_tree, render_tree
from StructFlow.Graph.Graph import app_graph, render_graph
from flask import Flask, request, jsonify
from flask_cors import CORS

# יצירת שרת Flask מרכזי
app = Flask(__name__)
CORS(app)

run_tree = False
run_graph = False

# נשתמש במשתנה גלובלי לתהליך השרת הפעיל
server_process = None

@app.route('/set_application', methods=['POST'])
def set_application():
    global run_tree, run_graph, server_process
    data = request.get_json()
    print("Received data:", data)
    app_name = data.get("application", "")

    if app_name == "tree":
        run_tree = True
        run_graph = False
    elif app_name == "graph":
        run_tree = False
        run_graph = True
    else:
        return jsonify({"error": "Invalid application"}), 400

    # אם יש תהליך שרת פעיל, נסגור אותו
    if server_process is not None:
        server_process.terminate()
        server_process.join()
    
    # ניצור תהליך חדש לפי הבחירה
    if run_tree:
        server_process = multiprocessing.Process(target=run_tree_server)
        server_process.start()
    elif run_graph:
        server_process = multiprocessing.Process(target=run_graph_server)
        server_process.start()

    return jsonify({"message": f"{app_name} server started"})

def run_tree_server():
    # אם יש צורך, הרץ thread לרינדור העץ
    render_thread = threading.Thread(target=render_tree, daemon=True)
    render_thread.start()
    app_tree.run(host="0.0.0.0", port=5000, debug=False, threaded=True)

def run_graph_server():
    # אתחל משתנה בוליאני שמוודא שהלולאה ברינדור הגרף תופעל כראוי
    global rendering_active
    rendering_active = True
    render_thread = threading.Thread(target=render_graph, daemon=True)
    render_thread.start()
    app_graph.run(host="0.0.0.0", port=5001, debug=False, threaded=True)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000, debug=False, threaded=True)
