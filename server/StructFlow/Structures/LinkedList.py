import pygame
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS
import time
from StructFlow.Video_feed import *
from StructFlow.Structures.LinkedListFunc import *
from StructFlow.Node import *
from StructFlow.Screen import *
from StructFlow.DisplayMessage import *


app_LinkedList = Flask(__name__)
CORS(app_LinkedList)


pygame.init()
clock = pygame.time.Clock()

current_message = None
message_timer = 0


output_frame = None
lock = threading.Lock()


class LinkedList:
    def __init__(self):
        self.head = None
        self.highlighted_node = None
        self.search_target = None
        self.animating = False


    def add(self, value):
        if not self.head:
            self.head = Node(value, NODE_SPACING, ROW_SPACING)
        else:
            # Traverse to the end of the list
            current = self.head
            while current.next:
                current = current.next
            # Determine new node position
            new_x = current.x + NODE_SPACING
            new_y = current.y
            if new_x + NODE_RADIUS * 2 > SCREEN_WIDTH:  # Move to next row
                new_x = NODE_SPACING
                new_y += ROW_SPACING
            current.next = Node(value, new_x, new_y)

    def remove_last(self):
        if not self.head:
            return

        if not self.head.next:
            self.head = None
            update_positions(self)
            return


        current = self.head
        while current.next and current.next.next:
            current = current.next


        current.next = None
        update_positions(self)



linked_list = LinkedList()

@app_LinkedList.route('/insert', methods=['POST'])
def insert():
    global current_message,message_timer
    data = request.get_json()
    num = int(data["key"])
    if num and num >= 0:
        linked_list.add(num)
        current_message = f"The number {num} is added at the end of the list"
        message_timer = pygame.time.get_ticks() + 2000
        return jsonify({"message": f"{num} was inserted to LinkedList"}), 200
    else:
        return jsonify({"error": "need to insert positive number"}), 400

@app_LinkedList.route('/delete',methods=['GET'])
def delete():
    global current_message,message_timer
    if linked_list.head is not None:
        linked_list.remove_last()
        current_message = "The last element in the list has been removed"
        message_timer = pygame.time.get_ticks() + 2000
        return jsonify({"message": "the last node was deleted from LinkedList"}), 200
    else:
        return jsonify({"error": "cant delete last node from empty linkedlist"}), 400
    

@app_LinkedList.route('/search_node', methods=['POST'])
def search_node():
    data = request.get_json()
    num = int(data["key"])
    if num >= 0:
        if linked_list.search_target is None:  
            linked_list.search_target = num
            threading.Thread(target=threaded_search(linked_list,num,lock), args=(num,), daemon=True).start()
            return jsonify({"message": f"Searching for {num} in linked list..."}), 200
        else:
            return jsonify({"message": "Search already in progress"}), 202
    else:
        return jsonify({"error": f"Invalid value"}), 400

@app_LinkedList.route('/reset', methods = ['GET'])
def reset():
    global linked_list
    linked_list = LinkedList()  
    return jsonify({"message": "Linked list has been reset."}), 200
    




    
def get_output_frame():

    global output_frame
    if output_frame is not None:
        return output_frame.copy()
    return None

Video_Feed = VideoFeed(get_output_frame, lock)

def render_linkedlist():
    global lock, output_frame
    running = True
    while running:
        if not linked_list.animating:
            clear_screen()
            update_positions(linked_list)
            draw(linked_list, screen)
            pygame.display.update()

        if current_message and pygame.time.get_ticks() < message_timer:
            display_message(screen,current_message,font,BLACK)

        with lock:
            output_frame = get_frame().copy()

        pygame.time.wait(50)
        clock.tick(20)




@app_LinkedList.route('/video_feed_LinkedList')
def video_feed_LinkedList():
    return Video_Feed.response()