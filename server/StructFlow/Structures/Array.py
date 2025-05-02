import pygame
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS
import time
from StructFlow.Video_feed import *
from StructFlow.Node import *
from StructFlow.Screen import *
from StructFlow.DisplayMessage import *
from StructFlow.Structures.ArrayFunc import *
from StructFlow.Sorts.BubbleSort import *


app_Array = Flask(__name__)
CORS(app_Array)


pygame.init()
clock = pygame.time.Clock()

current_message = None
message_timer = 0


output_frame = None
lock = threading.Lock()


array = []
running = True
user_input = ""
error_message = ""
message_time = None
animating = False


@app_Array.route("/insert_Array",methods=['POST'])
def insert_Array():
    global current_message,message_timer,array
    data = request.get_json()
    num = data['key']
    if num and num >= 0:
        if len(array)<13:
            array.append(num)
            current_message = f"The number {num} is added to the array"
            message_timer = pygame.time.get_ticks() + 2000
            return jsonify({"message": f"{num} was inserted to Array"}), 200
        else:
            return jsonify({"error": "this max array size"}), 400
    else:
        return jsonify({"error": "need to insert positive number lower then 1000"}), 400
    
@app_Array.route("/delete_Array",methods=['POST'])
def delete_Array():
    global current_message,message_timer,array
    data = request.get_json()
    num = data['key']
    if num and num >= 0:
        if len(array) > 0:
            if num in array:
                array.remove(num)
                current_message = f"The number {num} is removed array"
                message_timer = pygame.time.get_ticks() + 2000
                return jsonify({"message": f"{num} has been removed from Array"}), 200
            else:
                return jsonify({"error": "num in the input not in array"}), 400
        else:
            return jsonify({"error": "cant delete from empty array"}), 400
    else:
        return jsonify({"error": "need to insert positive number lower then 1000"}), 400
    
@app_Array.route("/Bubble_Sort",methods=["GET"])
def Bubble_Sort():
    global animating
    if len(array)>1:
        animating = True
        bubble_sort(array)
        animating = False
        return jsonify({"massage": "the sort complete"}), 200
    else:
        return jsonify({"error": "you cant sort this array"}), 400
    



def get_output_frame():

    global output_frame
    if output_frame is not None:
        return output_frame.copy()
    return None

Video_Feed = VideoFeed(get_output_frame, lock)

def render_Array():
    global lock, output_frame
    running = True
    while running:
        if not animating:
            clear_screen()
            draw_array(array)
            pygame.display.update()

        if current_message and pygame.time.get_ticks() < message_timer:
            display_message(screen,current_message,font,BLACK)


        with lock:
            output_frame = get_frame().copy()

        pygame.time.wait(50)
        clock.tick(20)


@app_Array.route('/video_feed_Array')
def video_feed_Array():
    return Video_Feed.response()