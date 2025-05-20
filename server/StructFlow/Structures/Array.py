from flask import Flask, request, jsonify
from flask_cors import CORS
from StructFlow.Node import *
from StructFlow.Sorts.BubbleSort import *


app_Array = Flask(__name__)
CORS(app_Array)

array = []


@app_Array.route("/data",methods=["GET"])
def get_data():
    return jsonify({"array": array}), 200

@app_Array.route("/insert_Array",methods=['POST'])
def insert_Array():
    data = request.get_json()
    num = data['key']
    if num and num >= 0 and num < 10000:
        if len(array)<12:
            array.append(num)
            return jsonify({"message": f"{num} was inserted to Array"}), 200
        else:
            return jsonify({"error": "this max array size"}), 400
    else:
        return jsonify({"error": "need to insert positive number lower then 1000"}), 400
    
@app_Array.route("/delete_Array",methods=["POST"])
def delete_Array():
    data = request.get_json()
    num = data['key']
    if num and num >= 0 and num < 10000:
        if num in array:
            array.remove(num)
            return jsonify({"message": f"{num} has been removed from Array"}), 200
        else:
                return jsonify({"error": "num in the input not in array"}), 400
    else:
        return jsonify({"error": "need to insert positive number lower then 10000"}), 400

@app_Array.route("/Bubble_Sort",methods=["GET"])
def Bubble_Sort():
    global array
    steps = bubble_sort(array)
    array = steps["sorted_array"]
    return jsonify(steps), 200

@app_Array.route("/reset_array",methods=["GET"])
def reset_array():
    global array
    array = []
    return jsonify({"message": "array reset"}), 200
