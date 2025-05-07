from flask import Flask, jsonify, request
from flask_cors import CORS

app_LinkedList = Flask(__name__)
CORS(app_LinkedList)

# ----- Node and LinkedList Classes -----

class Node:
    def __init__(self, value, x, y):
        self.value = value
        self.x = x
        self.y = y
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
        self.spacing_x = 100
        self.spacing_y = 80
        self.node_radius = 25
        self.screen_width = 700
        self.screen_height = 600

    def to_list(self):
        result = []
        current = self.head
        while current:
            result.append({
                "value": current.value,
                "x": current.x,
                "y": current.y
            })
            current = current.next
        return result

    def add(self, value):
        if not self.head:
            self.head = Node(value, self.spacing_x, self.spacing_y)
        else:
            current = self.head
            while current.next:
                current = current.next
            new_x = current.x + self.spacing_x
            new_y = current.y
            if new_x + self.spacing_x > self.screen_width:
                new_x = self.spacing_x
                new_y += self.spacing_y
            current.next = Node(value, new_x, new_y)

    def remove_last(self):
        if not self.head:
            return
        if not self.head.next:
            self.head = None
            return
        current = self.head
        while current.next and current.next.next:
            current = current.next
        current.next = None

    def reset(self):
        self.head = None


    
    def search(self, value):
        current = self.head
        found = False
        while current:
            current.highlight = False  # ננקה קודם כל
            if current.value == value:
                current.highlight = True
                found = True
            current = current.next
        return found

# ----- Flask API Setup -----

linked_list = LinkedList()

@app_LinkedList.route('/insert', methods=['POST'])
def insert():
    data = request.get_json()
    value = int(data.get('key'))
    if value < 0:
        return jsonify({"error": "Invalid input"}), 400
    linked_list.add(value)
    return jsonify({"message": f"{value} inserted successfully"}), 200

@app_LinkedList.route('/delete', methods=['GET'])
def delete():
    linked_list.remove_last()
    return jsonify({"message": "Last node deleted"}), 200

@app_LinkedList.route('/reset', methods=['GET'])
def reset():
    linked_list.reset()
    return jsonify({"message": "Linked list reset"}), 200

@app_LinkedList.route('/data', methods=['GET'])
def get_data():
    return jsonify({"nodes": linked_list.to_list()}), 200


@app_LinkedList.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    value = int(data.get('key'))
    if value < 0:
        return jsonify({"error": "Invalid input"}), 400

    steps = []
    current = linked_list.head
    while current:
        step = {
            "value": current.value,
            "x": current.x,
            "y": current.y,
            "status": "searching" if current.value != value else "found"
        }
        steps.append(step)
        if current.value == value:
            break
        current = current.next

    if not steps or steps[-1]["value"] != value:
        return jsonify({"steps": steps, "found": False}), 200
    return jsonify({"steps": steps, "found": True}), 200

