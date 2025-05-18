def bubble_sort(array):
    steps = []
    n = len(array)
    arr_copy = array.copy()
    
    for i in range(n):
        for j in range(n - i - 1):
            step = {
                "array": arr_copy.copy(),
                "highlight": [j, j + 1],
                "swapped": False
            }

            if arr_copy[j] > arr_copy[j + 1]:
                arr_copy[j], arr_copy[j + 1] = arr_copy[j + 1], arr_copy[j]
                step["array"] = arr_copy.copy()
                step["swapped"] = True

            steps.append(step)

    return {
        "steps": steps,
        "sorted_array": arr_copy 
    }
