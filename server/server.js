// const express = require ('express')
// const app = express()

// app.get("/api", (req, res) => {
//     res.json({ "users" : ["userOne", "userTwo", "userThree"]})
// })

// app.listen(5000, () => { console.log("server started on port 5000")})

import pygame
import cv2
import numpy as np
import threading
import time
from flask import Flask, Response

app = Flask(__name__)

# אתחול Pygame
pygame.init()
width, height = 800, 600
screen = pygame.Surface((width, height))
clock = pygame.time.Clock()

# משתנה לאחסון תמונת המשחק
output_frame = None
lock = threading.Lock()

def game_loop():
    global output_frame, lock
    running = True
    yellow = (255, 255, 0)
    blue = (0, 255, 255)
    
    while running:
        screen.fill((0, 0, 0))  # רקע שחור
        pygame.draw.rect(screen, yellow, (50, 50, 100, 100))
        pygame.draw.rect(screen, blue, (200, 50, 100, 100))

        # לכידת תמונת המשחק
        frame = pygame.surfarray.array3d(screen)
        frame = np.rot90(frame)  # התאמת הסיבוב
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)  # המרה ל-BGR עבור OpenCV

        with lock:
            output_frame = frame.copy()

        clock.tick(30)  # מגביל ל-30 פריימים לשנייה

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
    threading.Thread(target=game_loop, daemon=True).start()
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
