import pygame
import cv2
import numpy as np
import threading
import sys
import random
from tkinter import  messagebox
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
from StructFlow.Tree.BFS_Search import BFS_Search


app = Flask(__name__)
CORS(app)

# אתחול Pygame
pygame.init()
window_width, window_height = 800, 800
screen = pygame.Surface((window_width, window_height))
clock = pygame.time.Clock()

columns, rows = 25, 25
box_width = window_width // columns
box_height = window_height // rows
output_frame = None
lock = threading.Lock()

# מבנה ה-AVL Tree
class TreeNode:
    def __init__(self, key, parent=None):
        self.key = key
        self.left = None
        self.right = None
        self.height = 1
        self.parent = parent

class AVLTree:
    def __init__(self):
        self.root = None
        self.visited = set()
        self.nodes = []
        self.highest = 0 

    def insert(self, key):
        self.root = self._insert(self.root, key)
        self.nodes.append(key)

    def _insert(self, node, key, parent=None):
        if node is None:
            return TreeNode(key, parent)
        if key < node.key:
            node.left = self._insert(node.left, key, node)
        else:
            node.right = self._insert(node.right, key, node)

        node.height = 1 + max(self._get_height(node.left), self._get_height(node.right))
        balance = self._get_balance(node)

        if balance > 1:
            if key < node.left.key:
                return self._rotate_right(node)
            else:
                node.left = self._rotate_left(node.left)
                return self._rotate_right(node)

        if balance < -1:
            if key > node.right.key:
                return self._rotate_left(node)
            else:
                node.right = self._rotate_right(node.right)
                return self._rotate_left(node)

        return node


    def _get_height(self, node):
        if node is None:
            return 0
        return node.height

    def _get_balance(self, node):
        if node is None:
            return 0
        return self._get_height(node.left) - self._get_height(node.right)
    def delete(self, key):
        self.root = self._delete(self.root, key)

    def _delete(self, node, key):
        if node is None:
            return node

        if key < node.key:
            node.left = self._delete(node.left, key)
        elif key > node.key:
            node.right = self._delete(node.right, key)
        else:
            if node.left is None:
                temp = node.right
                node = None
                return temp
            elif node.right is None:
                temp = node.left
                node = None
                return temp


            temp = self.get_min_node(node.right)
            node.key = temp.key
            node.right = self._delete(node.right, temp.key)

        if node is None:
            return node

        node.height = 1 + max(self._get_height(node.left), self._get_height(node.right))


        balance = self._get_balance(node)


        if balance > 1:
            if key < node.left.key:
                return self._rotate_right(node)
            else:
                node.left = self._rotate_left(node.left)
                return self._rotate_right(node)

        # Right Heavy
        if balance < -1:
            if key > node.right.key:
                return self._rotate_left(node)
            else:
                node.right = self._rotate_right(node.right)
                return self._rotate_left(node)

        return node


    def get_min_node(self, node):
        return node if not node or not node.left else self.get_min_node(node.left)

    def _rotate_left(self, z):
        if z is None or z.right is None:
            return z
        y = z.right
        T2 = y.left

        y.left = z
        z.right = T2

        z.height = 1 + max(self._get_height(z.left), self._get_height(z.right))
        y.height = 1 + max(self._get_height(y.left), self._get_height(y.right))

        return y

    def _rotate_right(self, y):
        if y is None or y.left is None:
            return y
        x = y.left
        T2 = x.right

        x.right = y
        y.left = T2

        y.height = 1 + max(self._get_height(y.left), self._get_height(y.right))
        x.height = 1 + max(self._get_height(x.left), self._get_height(x.right))

        return x
    

    def BFS_Search(self, highest, BFS_order):
        current_level = BFS_order[highest:]
        targets = []
        if self.root is None:
            return highest, BFS_order, targets

        if not BFS_order:  
            BFS_order.append(self.root)
            self.visited.add(self.root.key)
            targets.append(self.root)
            return highest, BFS_order,targets

        

        for node in current_level:
            if node.left and node.left.key not in self.visited:
                BFS_order.append(node.left)
                self.visited.add(node.left.key)
                targets.append(node.left)
            if node.right and node.right.key not in self.visited:
                BFS_order.append(node.right)
                self.visited.add(node.right.key)
                targets.append(node.right)
            highest += 1

        return highest, BFS_order, targets






avl_tree = AVLTree()

@app.route('/insert', methods=['POST'])
def insert():
    data = request.get_json()
    key = int(data["key"])
    avl_tree.insert(key)
    return jsonify({"status": "inserted", "key": key})

@app.route('/delete', methods=['POST'])
def delete():
    data = request.get_json()
    key = int(data["key"])
    avl_tree.delete(key)
    return jsonify({"status": "deleted", "key": key})

@app.route('/get_tree', methods=['GET'])
def get_tree():
    return jsonify({"nodes": avl_tree.nodes})


@app.route('/bfs', methods=['GET'])
def bfs():
    global highest, BFS_order 

   
    if 'highest' not in globals() or highest is None:
        highest = 0
    if 'BFS_order' not in globals() or not BFS_order:
        BFS_order = []


    highest, BFS_order, targets = avl_tree.BFS_Search(highest, BFS_order)
    
    
    visited_nodes = [node.key for node in BFS_order]
    print(visited_nodes)
    highlighted_numbers = [node.key for node in targets]

    return jsonify({
        "bfs_order": visited_nodes,
        "highlighted_numbers": highlighted_numbers
    })



@app.route('/dfs', methods=['GET'])
def dfs():
    dfs_order = avl_tree.DFS_order()
    return jsonify({"dfs_order": dfs_order})

def draw_tree(node, x, y, level=0, spacing=150):
    if node is None:
        return

    font = pygame.font.Font(None, 36)
    text = font.render(str(node.key), True, (255, 255, 255))

    pygame.draw.circle(screen, (0, 0, 255), (x, y), 20) 
    pygame.draw.circle(screen, (0, 0, 0), (x, y), 21, 2) 
    screen.blit(text, (x - 10, y - 10))

    next_y = y + 75  

    spacing = max(75, spacing // 1.5)  

    line_offset = 20

    if node.left:
        x_left = x - spacing // (level + 1)
        pygame.draw.line(screen, (0, 0, 0), (x, y+line_offset), (x_left, next_y), 2)
        draw_tree(node.left, x_left, next_y, level + 1, spacing)

    if node.right:
        x_right = x + spacing // (level + 1)
        pygame.draw.line(screen, (0, 0, 0), (x, y+line_offset), (x_right, next_y), 2)
        draw_tree(node.right, x_right, next_y, level + 1, spacing)



def render_tree():
    global output_frame, lock
    running = True
    # messagebox.showinfo("Tutorial\n",
    #                     "Up Button : add Number to AVL Tree\nDown Button : remove Number from AVL Tree\n\n\n"
    #                     "after you finish build the Tree:\n\nLeft Button: press few times to see the order of BFS\n"
    #                     "Right Button: press few times to see the order of DFS\n\n\nAfter press Left OR Right Button you can press Space to clear")
    # input_number = ""
    # TreeNumbers = []
    # BFS_order = []
    # Highest = 0
    # DFS_order = []
    # stack = []
    # highlighted_numbers = []
    # targets = []
    # visited_nodes = []
    # BFS_activate = False
    # DFS_activate = False
    while running:
        screen.fill((255, 255, 255))

        if avl_tree.root:
            draw_tree(avl_tree.root, window_width // 2, 100) 

        frame = pygame.surfarray.array3d(screen)
        frame = np.rot90(frame)
        frame = cv2.flip(frame, 0)  
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
    threading.Thread(target=render_tree, daemon=True).start()
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
