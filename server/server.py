from StructFlow.Tree.AvlTree import app, render_tree
import threading

if __name__ == "__main__":
    # הפעלת השרשור של הצגת העץ
    threading.Thread(target=render_tree, daemon=True).start()
    
    # הרצת השרת Flask
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
