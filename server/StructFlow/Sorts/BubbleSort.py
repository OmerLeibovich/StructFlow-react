import time
from StructFlow.Screen import *
from StructFlow.Structures.ArrayFunc import *
from StructFlow.DisplayMessage import *

def bubble_sort(array):
    n = len(array)
    for i in range(n):
        for j in range(n - i - 1):
            clear_screen()
            draw_array(array, highlight_indices=[j, j + 1])
            update_screen()
            time.sleep(1)

            if array[j] > array[j + 1]:
                array[j], array[j + 1] = array[j + 1], array[j]
                clear_screen()
                draw_array(array, highlight_indices=[j, j + 1])
                display_message(screen,f"{array[j]} is lower than {array[j + 1]}, replace them",font,BLACK)
                update_screen()
                time.sleep(1)

    clear_screen()
    draw_array(array)
    update_screen()
