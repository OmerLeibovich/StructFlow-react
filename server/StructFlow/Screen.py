import pygame
import cv2
import numpy as np



# Define constants
SCREEN_WIDTH = 700
SCREEN_HEIGHT = 650
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
BLUE = (0, 0, 255)
RED = (255, 0, 0)
YELLOW = (255, 255, 0)
RECT_WIDTH = 50
RECT_HEIGHT = 50
SPACING = 35 
MAX_ARRAY_SIZE = 14  
NODE_RADIUS = 20
NODE_SPACING = 60
ROW_SPACING = 80
NODE_SPACING = 60
ROW_SPACING = 80
BUTTON_WIDTH = 100
BUTTON_HEIGHT = 40
CIRCLE_RADIUS = 20 
MIN_DISTANCE = CIRCLE_RADIUS * 2  
columns, rows = 25, 25
box_width = SCREEN_WIDTH  // columns
box_height = SCREEN_HEIGHT // rows


RECT_WIDTH, RECT_HEIGHT = 50, 50
QUEUE_START_X, QUEUE_START_Y = 350, 250
SPACING = 10




screen = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.font.init()
font = pygame.font.Font(None, 36)



def initialize_screen(title="Pygame Visualization"):
    pygame.display.set_caption(title)
    return screen
# Function to clear screen
def clear_screen(color=WHITE):
    screen.fill(color)

# Function to update the screen
def update_screen():
    pygame.display.flip()

def get_frame():
    frame = pygame.surfarray.array3d(screen)
    frame = np.rot90(frame)
    frame = cv2.flip(frame, 0)
    frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
    return frame