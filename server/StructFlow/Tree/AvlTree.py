from flask import Flask, jsonify, request
from flask_cors import CORS
from StructFlow.TreeNode import *
from StructFlow.Tree.BFS_Search import *

app_Avl = Flask(__name__)
CORS(app_Avl)


visited_nodes = []



# ---------- Node & AVLTree Classes ----------


class AVLTree:
    def __init__(self):
        self.root = None
        self.visited = set()
        self.nodes = []
        self.highest = 0 
        self.max_size = 31

    def insert(self, key):
        self.root = self._insert(self.root, key)

    def _insert(self, node, key, parent=None):
        if not node:
            return TreeNode(key, parent)

        if key < node.key:
            node.left = self._insert(node.left, key, node)
        elif key > node.key:
            node.right = self._insert(node.right, key, node)
        else:
            return node  # No duplicates

        node.height = 1 + max(self._get_height(node.left),
                              self._get_height(node.right))

        balance = self._get_balance(node)

        # Left Left
        if balance > 1 and key < node.left.key:
            return self._rotate_right(node)

        # Right Right
        if balance < -1 and key > node.right.key:
            return self._rotate_left(node)

        # Left Right
        if balance > 1 and key > node.left.key:
            node.left = self._rotate_left(node.left)
            return self._rotate_right(node)

        # Right Left
        if balance < -1 and key < node.right.key:
            node.right = self._rotate_right(node.right)
            return self._rotate_left(node)

        return node

    def delete(self, key):
        self.root = self._delete(self.root, key)

    def _delete(self, node, key):
        if not node:
            return node

        if key < node.key:
            node.left = self._delete(node.left, key)
        elif key > node.key:
            node.right = self._delete(node.right, key)
        else:
            if not node.left:
                return node.right
            elif not node.right:
                return node.left

            temp = self._min_value_node(node.right)
            node.key = temp.key
            node.right = self._delete(node.right, temp.key)

        node.height = 1 + max(self._get_height(node.left),
                              self._get_height(node.right))

        balance = self._get_balance(node)

        # Rebalance cases
        if balance > 1 and self._get_balance(node.left) >= 0:
            return self._rotate_right(node)

        if balance > 1 and self._get_balance(node.left) < 0:
            node.left = self._rotate_left(node.left)
            return self._rotate_right(node)

        if balance < -1 and self._get_balance(node.right) <= 0:
            return self._rotate_left(node)

        if balance < -1 and self._get_balance(node.right) > 0:
            node.right = self._rotate_right(node.right)
            return self._rotate_left(node)

        return node

    def _rotate_left(self, z):
        y = z.right
        T2 = y.left

        y.left = z
        z.right = T2

        z.height = 1 + max(self._get_height(z.left), self._get_height(z.right))
        y.height = 1 + max(self._get_height(y.left), self._get_height(y.right))

        return y

    def _rotate_right(self, y):
        x = y.left
        T2 = x.right

        x.right = y
        y.left = T2

        y.height = 1 + max(self._get_height(y.left), self._get_height(y.right))
        x.height = 1 + max(self._get_height(x.left), self._get_height(x.right))

        return x

    def _get_height(self, node):
        return node.height if node else 0

    def _get_balance(self, node):
        return self._get_height(node.left) - self._get_height(node.right) if node else 0

    def _min_value_node(self, node):
        current = node
        while current.left:
            current = current.left
        return current

    # --- Convert tree to JSON format for D3/SVG ---
    def to_dict(self, node=None):
        if node is None:
            node = self.root
        if node is None:
            return {}

        result = { "name": node.key }

        if node.left:
            result["left"] = self.to_dict(node.left)
        if node.right:
            result["right"] = self.to_dict(node.right)

        return result


# ---------- Global Tree ----------
avl_tree = AVLTree()

# ---------- API Routes ----------

@app_Avl.route('/insert', methods=['POST'])
def insert():
    data = request.get_json()
    try:
        key = int(data['key'])
        avl_tree.insert(key)
        return jsonify({"status": "inserted"}), 200
    except:
        return jsonify({"error": "Invalid input"}), 400

@app_Avl.route('/delete', methods=['POST'])
def delete():
    data = request.get_json()
    try:
        key = int(data['key'])
        avl_tree.delete(key)
        return jsonify({"status": "deleted"}), 200
    except:
        return jsonify({"error": "Invalid input"}), 400

@app_Avl.route('/get_tree_svg', methods=['GET'])
def get_tree_svg():
    return jsonify(avl_tree.to_dict()), 200

@app_Avl.route('/reset', methods=['GET'])
def reset():
    global avl_tree
    avl_tree = AVLTree()
    return jsonify({"status": "reset"}), 200

@app_Avl.route('/BFS', methods=["GET"])
def get_BFS_Order():
    global highest, BFS_order, bfs_state, visited_nodes

    bfs_state = True

    if 'highest' not in globals() or highest is None:
        highest = 0
    if 'BFS_order' not in globals() or not BFS_order:
        BFS_order = []

    highest, BFS_order, BFS_targets = BFS_Search(avl_tree, highest, BFS_order)

    visited_nodes = [node.key for node in BFS_order]
    highlighted_numbers = [node.key for node in BFS_order]


    print (highlighted_numbers)

    return jsonify({
        "highlighted_nodes": highlighted_numbers
    })

