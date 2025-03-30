import pygame
import cv2
import threading
import sys
import random
from tkinter import  messagebox
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
from StructFlow.Tree.BFS_Search import BFS_Search
from StructFlow.Tree.DFS_Search import DFS_Search
from StructFlow.Screen import *



app_tree = Flask(__name__)
CORS(app_tree)



pygame.init()
clock = pygame.time.Clock()
output_frame = None
lock = threading.Lock()
bfs_state=False
dfs_state = False
visited_nodes = []
DFS_Targets = []

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
        self.max_size = 31

    def insert(self, key):
        if self.contains(key):
            return
        
        valid_nodes = [n for n in self.nodes if n is not None]  
        current_height = self._get_height(self.root)
        if len(valid_nodes) >= self.max_size and current_height >= 5:
            print("Error: Tree is full (max size reached: 31)")
            return
        self.update_nodes() 
        self.root = self._insert(self.root, key)
        self.nodes.append(key)

    def contains(self, key):
        return self._contains(self.root, key)

    def _contains(self, node, key):
        if node is None:
            return False
        if key == node.key:
            return True
        elif key < node.key:
            return self._contains(node.left, key)
        else:
            return self._contains(node.right, key)

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
        self.update_nodes() 
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
    

    
    def update_nodes(self):
        self.nodes.clear()  
        self.update_array(self.root, self.nodes)
        print("Updated nodes:", self.nodes)
    
    
    def update_array(self, node, array, index=0):
        if node is not None:
            
            if index >= len(array):
                array.extend([None] * (index - len(array) + 1)) 

        
            array[index] = node.key
            if len(array) > 1 and array[-1] == array[-2]:
                array.remove(array[-1])

            
            self.update_array(node.left, array, 2 * index + 1)
            self.update_array(node.right, array, 2 * index + 2)
        else: 
            if index < len(array):
                if node is None:
                    array[index] = None

        while array and array[-1] is None:
            array.pop()

    
avl_tree = AVLTree()

@app_tree.route('/insert_AVL', methods=['POST'])
def insert():
    global dfs_state,bfs_state
    if not dfs_state and not bfs_state:
        data = request.get_json()
        key = int(data["key"])
        avl_tree.insert(key)
        avl_tree.update_array(avl_tree.root, avl_tree.nodes)
        return jsonify({"status": "inserted", "key": key})
    else:
        return jsonify({"error": "Cannot insert while BFS Or DFS is active"}), 400

@app_tree.route('/delete_AVL', methods=['POST'])
def delete():
    global dfs_state,bfs_state
    if not dfs_state and not bfs_state:
        data = request.get_json()
        key = int(data["key"])
        avl_tree.delete(key)
        avl_tree.update_array(avl_tree.root, avl_tree.nodes)
        return jsonify({"status": "deleted", "key": key})
    else:
        return jsonify({"error": "Cannot delete while BFS Or DFS is active"}), 400

@app_tree.route('/get_tree', methods=['GET'])
def get_tree():
    return jsonify({"nodes": avl_tree.nodes})


@app_tree.route('/bfs', methods=['GET'])
def bfs():
    global highest, BFS_order,bfs_state,visited_nodes,dfs_state

    if dfs_state:  
        return jsonify({"error": "Cannot run DFS while BFS is active"}), 400
 

    bfs_state=True

    
    if 'highest' not in globals() or highest is None:
        highest = 0
    if 'BFS_order' not in globals() or not BFS_order:
        BFS_order = []


    highest, BFS_order, BFS_targets = BFS_Search(avl_tree,highest,BFS_order)
        
        
    visited_nodes = [node.key for node in BFS_order]
        
    highlighted_numbers = [node.key for node in BFS_targets]

    return jsonify({
        "bfs_order": visited_nodes,
           "highlighted_numbers": highlighted_numbers
        })


@app_tree.route('/dfs', methods=['GET'])
def dfs():
    global Stack, DFS_order, dfs_state, DFS_Targets,bfs_state


    if bfs_state: 
        return jsonify({"error": "Cannot run DFS while BFS is active"}), 400
    
    dfs_state = True

    if 'DFS_Targets' not in globals() or DFS_Targets is None:
        DFS_Targets = []

    if 'Stack' not in globals() or Stack is None:
        Stack = []
    if 'DFS_order' not in globals() or not DFS_order:
        DFS_order = []

    Stack, DFS_order, DFS_Target = DFS_Search(avl_tree, Stack, DFS_order)

        
    if DFS_Target is not None:  
        DFS_Targets.append(DFS_Target)  


    return jsonify({"dfs_order": DFS_Targets})


@app_tree.route('/reset_AVL', methods=['GET'])
def reset():
    global avl_tree, Stack, DFS_order, BFS_order, DFS_Targets, bfs_state, dfs_state, highest

    avl_tree = AVLTree()  
    Stack = []
    DFS_order = []
    BFS_order = []
    DFS_Targets = []
    bfs_state = False
    dfs_state = False
    highest = 0 

    return jsonify({"status": "reset successful", "nodes": []}), 200

@app_tree.route('/reset_bfs', methods=['GET'])
def reset_bfs():
    global highest, BFS_order, bfs_state, visited_nodes
    
    highest = 0
    BFS_order = []
    bfs_state = False
    visited_nodes = []
    avl_tree.visited.clear()

    return jsonify({"status": "reset successful", "BFS_nodes": []}), 200



@app_tree.route('/reset_dfs', methods=['GET'])
def reset_dfs():
    global Stack, DFS_order, dfs_state, DFS_Targets
    Stack = []
    DFS_order = []
    DFS_Targets = []
    dfs_state = False
    avl_tree.visited.clear()
    return jsonify({"status": "reset successful", "DFS_nodes": []}), 200









def draw_tree(node, x, y, level=0, spacing=150, visited_nodes=None, DFS_Targets=None):
    if node is None:
        return

    node_color = (255, 0, 0) if (visited_nodes is not None 
                                 and node.key in visited_nodes) or (DFS_Targets is not None 
                                                                    and node.key in DFS_Targets) else (0, 0, 255)


    pygame.draw.circle(screen, node_color, (x, y), 20)
    pygame.draw.circle(screen, (0, 0, 0), (x, y), 21, 2)  

    text = font.render(str(node.key), True, (255, 255, 255))
    text_rect = text.get_rect(center=(x, y))
    screen.blit(text, text_rect)

    spacing = max(75, spacing // 1.5)  
    line_offset = 20  

    
    if node.left:
        x_left = x - (700 // (2 ** (level + 2)))
        y_left = y + 100
        pygame.draw.line(screen, (0, 0, 0), (x, y + line_offset), (x_left, y_left), 2)
        draw_tree(node.left, x_left, y_left, level + 1, spacing, visited_nodes, DFS_Targets)

    if node.right:
        x_right = x + (700 // (2 ** (level + 2)))
        y_right = y + 100
        pygame.draw.line(screen, (0, 0, 0), (x, y + line_offset), (x_right, y_right), 2)
        draw_tree(node.right, x_right, y_right, level + 1, spacing, visited_nodes, DFS_Targets)


def render_tree():
    global output_frame, lock, visited_nodes, bfs_state, dfs_state, DFS_Targets
    running = True
    while running:
        clear_screen()

        if avl_tree.root:
            if bfs_state and visited_nodes: 
                draw_tree(avl_tree.root, window_width // 2, 100, visited_nodes=visited_nodes, DFS_Targets=[])
            elif dfs_state and DFS_Targets:
                draw_tree(avl_tree.root, window_width // 2, 100, visited_nodes=[], DFS_Targets=DFS_Targets)
            else:
                draw_tree(avl_tree.root, window_width // 2, 100)


        with lock:
            output_frame = get_frame().copy()
        
        pygame.time.wait(50)  
        clock.tick(20)  


@app_tree.route('/video_feed_AVL_Tree')
def video_feed_AVL_Tree():
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




