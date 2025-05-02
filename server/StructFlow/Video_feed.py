import cv2
from flask import Response


Video_Feed = None 

class VideoFeed:
    def __init__(self, get_frame_func, lock):
        self.get_frame_func = get_frame_func
        self.lock = lock

    def generate(self):
        while True:
            with self.lock:
                frame = self.get_frame_func()
                if frame is None:
                    continue
                _, buffer = cv2.imencode(".jpg", frame)
                frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    def response(self):
        return Response(self.generate(), mimetype="multipart/x-mixed-replace; boundary=frame")
