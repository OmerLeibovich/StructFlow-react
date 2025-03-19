import pygame

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
SPACING = 35  # Space between rectangles
MAX_ARRAY_SIZE = 14  # Maximum number of elements in the array
NODE_RADIUS = 20
NODE_SPACING = 60
ROW_SPACING = 80
NODE_SPACING = 60
ROW_SPACING = 80
BUTTON_WIDTH = 100
BUTTON_HEIGHT = 40


RECT_WIDTH, RECT_HEIGHT = 50, 50
QUEUE_START_X, QUEUE_START_Y = 350, 250
SPACING = 10




screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
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