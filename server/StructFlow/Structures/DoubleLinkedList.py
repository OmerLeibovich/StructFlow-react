from flask import Flask, jsonify, request
from flask_cors import CORS
from StructFlow.Structures.LinkedList import LinkedList
from StructFlow.Node import Node

app_Double_LinkedList = Flask(__name__)
CORS(app_Double_LinkedList)


class DoubleLinkedList(LinkedList):
    def __init__(self):
        super().__init__()
        self.tail = None
        self.mode = "head" 

    def add(self, value):
        new_node = Node(value, 0, 0)
        if self.mode == "head":
            if not self.head:
                self.head = self.tail = new_node
            else:
                new_node.next = self.head
                self.head.prev = new_node
                self.head = new_node
        elif self.mode == "tail":
            if not self.tail:
                self.head = self.tail = new_node
            else:
                new_node.prev = self.tail
                self.tail.next = new_node
                self.tail = new_node

        update_positions(self)



    def remove(self):
        if not self.head:
            return
        if self.head == self.tail:
            self.head = self.tail = None
        elif self.mode == "head":
            self.head = self.head.next
            if self.head:
                self.head.prev = None
        elif self.mode == "tail":
            self.tail = self.tail.prev
            if self.tail:
                self.tail.next = None

        update_positions(self)


    def length(self):
        count = 0
        current = self.head
        while current:
            count += 1
            current = current.next
        return count
    
def update_positions(linked_list):
    x = 100
    y = 80
    spacing_x = 100
    spacing_y = 80
    max_width = 1000

    current = linked_list.head
    while current:
        current.x = x
        current.y = y
        x += spacing_x
        if x + spacing_x > max_width:
            x = 100
            y += spacing_y
        current = current.next




Double_LinkedList = DoubleLinkedList()


@app_Double_LinkedList.route('/data', methods=['GET'])
def get_data():
    return jsonify({"nodes": Double_LinkedList.to_list()}), 200


@app_Double_LinkedList.route('/insert_doubleLinkedList', methods=['POST'])
def insert_doubleLinkedList():
    data = request.get_json()
    num = data ['key']
    side = data ['side']
    Double_LinkedList.mode = side
    if num and num >= 0 and num < 10000:
        Double_LinkedList.add(num)
        return jsonify({"message": f"{num} was inserted to LinkedList"}), 200
    else:
       return jsonify({"error": "need to insert positive number lower then 1000"}), 400
    
@app_Double_LinkedList.route('/delete_doubleLinkedList',methods=["POST"])
def delete_doubleLinkedList():
        data = request.get_json()
        side = data['side']
        Double_LinkedList.mode = side
        if Double_LinkedList.head is not None and Double_LinkedList.tail is not None:
            Double_LinkedList.remove()
            return jsonify({"message": f"the element was deleted from {side} of the LinkedList"}), 200
        else:
            return jsonify({"error": "cant delete node from empty linkedlist"}), 400


@app_Double_LinkedList.route('/search_node', methods=['POST'])
def search():
    data = request.get_json()
    value = int(data.get('key'))
    side = data.get('side')
    if value < 0:
        return jsonify({"error": "Invalid input"}), 400

    steps = []
    current = Double_LinkedList.head if side == "head" else Double_LinkedList.tail
    direction = "next" if side == "head" else "prev"
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
        current = getattr(current, direction)

    if not steps or steps[-1]["value"] != value:
        return jsonify({"steps": steps, "found": False}), 200
    return jsonify({"steps": steps, "found": True}), 200

@app_Double_LinkedList.route('/reset', methods = ['GET'])
def reset():
     global Double_LinkedList
     Double_LinkedList = DoubleLinkedList()  
     return jsonify({"message": "Linked list has been reset."}), 200

# @app_Double_LinkedList.route('/insert_doubleLinkedList', methods=['POST'])
# def insert_doubleLinkedList():
#     global current_message,message_timer
#     data = request.get_json()
#     num = data['key']
#     side = data['side']
#     Double_LinkedList.mode = side
#     if num and num >= 0:
#         Double_LinkedList.add(num)
#         current_message = f"The number {num} is added at the {side} of the list"
#         message_timer = pygame.time.get_ticks() + 2000
#         return jsonify({"message": f"{num} was inserted to LinkedList"}), 200
#     else:
#         return jsonify({"error": "need to insert positive number lower then 1000"}), 400

# @app_Double_LinkedList.route('/delete_doubleLinkedList',methods=['POST'])
# def delete_doubleLinkedList():
#     global current_message,message_timer
#     data = request.get_json()
#     side = data['side']
#     Double_LinkedList.mode = side
#     num = 0
#     if Double_LinkedList.mode == "head":
#         num = Double_LinkedList.head.value
#     else:
#         num = Double_LinkedList.tail.value
#     if Double_LinkedList.head is not None and Double_LinkedList.tail is not None:
#         Double_LinkedList.remove()
#         current_message = f"The {num} has been removed from {side} of list"
#         message_timer = pygame.time.get_ticks() + 2000
#         return jsonify({"message": f"the element was deleted from {side} of the LinkedList"}), 200
#     else:
#         return jsonify({"error": "cant delete node from empty linkedlist"}), 400
    

# @app_Double_LinkedList.route('/search_node', methods=['POST'])
# def search_node():
#     data = request.get_json()
#     num = int(data["key"])
#     Double_LinkedList.mode = str(data["side"])
#     if num >= 0:
#         if Double_LinkedList.search_target is None:  
#             Double_LinkedList.search_target = num
#             threading.Thread(target=threaded_search(Double_LinkedList,num,lock,Double_LinkedList.mode), args=(num,), daemon=True).start()
#             return jsonify({"message": f"Searching for {num} in linked list..."}), 200
#         else:
#             return jsonify({"message": "Search already in progress"}), 202
#     else:
#         return jsonify({"error": f"Invalid value"}), 400
    

# @app_Double_LinkedList.route('/reset', methods = ['GET'])
# def reset():
#     global Double_LinkedList
#     Double_LinkedList = DoubleLinkedList()  
#     return jsonify({"message": "Linked list has been reset."}), 200


    
# # def get_output_frame():
# #     global output_frame
# #     if output_frame is not None:
# #         return output_frame.copy()
# #     return None

# # Video_Feed = VideoFeed(get_output_frame, lock)

# # def render_Double_linkedlist():
# #     global lock, output_frame, current_message, message_timer
# #     running = True
# #     while running:
# #         if not Double_LinkedList.animating:
# #             clear_screen()
# #             update_positions(Double_LinkedList)
# #             draw(Double_LinkedList, screen)

# #             if current_message and pygame.time.get_ticks() < message_timer:
# #                 display_message(screen,current_message,font,BLACK)

# #             pygame.display.update()

# #         with lock:
# #             output_frame = get_frame().copy()

# #         pygame.time.wait(50)
# #         clock.tick(20)



# # @app_Double_LinkedList.route('/video_feed_Double_LinkedList')
# # def video_feed_Double_LinkedList():
# #     return Video_Feed.response()