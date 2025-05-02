import pygame
from StructFlow.Screen import *


def draw(self, screen, current_search_node=None):
    current = self.head
    previous = None
    while current:
        if current == current_search_node:
            color = RED
        elif current == self.highlighted_node:
            color = (0, 255, 0) 
        else:
            color = BLUE

        pygame.draw.circle(screen, color, (current.x, current.y), NODE_RADIUS)
        text_surface = font.render(str(current.value), True, WHITE)
        text_rect = text_surface.get_rect(center=(current.x, current.y))
        screen.blit(text_surface, text_rect)

        if previous and current.y > previous.y:
            pygame.draw.line(screen, BLACK, (25, current.y),
                             (current.x - NODE_RADIUS, current.y), 3)
            arrow_head = [(current.x - NODE_RADIUS - 5, current.y - 5),
                          (current.x - NODE_RADIUS - 5, current.y + 5),
                          (current.x - NODE_RADIUS, current.y)]
            pygame.draw.polygon(screen, BLACK, arrow_head)

        if current.next and current.y == current.next.y:
            pygame.draw.line(screen, BLACK, (current.x + NODE_RADIUS, current.y),
                             (current.next.x - NODE_RADIUS, current.next.y), 3)
            arrow_head = [(current.next.x - NODE_RADIUS - 5, current.next.y - 5),
                          (current.next.x - NODE_RADIUS - 5, current.next.y + 5),
                          (current.next.x - NODE_RADIUS, current.next.y)]
            pygame.draw.polygon(screen, BLACK, arrow_head)

        previous = current
        current = current.next

def Search_Value(self, screen, value, lock , side = "head"):
    self.highlighted_node = None
    count = 0
    if not self.head and not self.tail:
        return "The list is empty"
    
    if side == "head":
        current = self.head
    else: 
        current = self.tail
    while current:
        clear_screen()

    
        draw(self, screen, current_search_node=current)

        
        text_surface = font.render(f"Checking: {current.value}", True, BLACK)
        screen.blit(text_surface, (270, 10))

        pygame.display.update()

        with lock:
            global output_frame
            output_frame = get_frame().copy()

        pygame.time.delay(800)  

        if current.value == value:
            self.highlighted_node = current
            clear_screen()
            draw(self, screen)
            if side == "tail":
                count  =  (self.length() - 1) - count 
            text_surface = font.render(f"Found value {current.value} at index {count} in the linked list.", True, BLACK)
            screen.blit(text_surface, (100, 350))
            
            pygame.display.update()

            with lock:
                output_frame = get_frame().copy()

            pygame.time.delay(1500) 
            return count
        if side == "head":
            current = current.next
        else:
            current = current.prev
        count += 1


    text_surface = font.render(f"Oops! {value} is not in the linked list.", True, BLACK)
    screen.blit(text_surface, (175, 350))
    pygame.time.delay(1500)
    self.highlighted_node = None
    return None



def reset_highlight(self):
        self.highlighted_node = None
        draw(self,screen)
        pygame.display.update()


def update_positions(self):
    current = self.head
    x = NODE_SPACING
    y = ROW_SPACING
    while current:
        current.x = x
        current.y = y
        # Check if the next node will fit within the current row
        if x + NODE_SPACING * 2 > SCREEN_WIDTH:  # Move to the next row if needed
            x = NODE_SPACING  # Reset x position
            y += ROW_SPACING  # Move to the next row
        else:
            x += NODE_SPACING  # Move to the next position in the row

        current = current.next

        # If the new row exceeds the screen height, break to avoid "sticking"
        if y + ROW_SPACING > SCREEN_HEIGHT:
            print("Error: Linked list exceeds screen height!")
            break

def threaded_search(self,value,lock,side = "head"):
    self.animating = True
    Search_Value(self, screen, value, lock , side)
    self.search_target = None
    self.animating = False