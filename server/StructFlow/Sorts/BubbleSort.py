def bubble_sort(array):
    steps = []
    n = len(array)
    arr_copy = array.copy()
    
    for i in range(n):
        for j in range(n - i - 1):
            step = {
                "highlight": [j, j + 1],
                "swapped": False
            }

            if arr_copy[j] > arr_copy[j + 1]:
                arr_copy[j], arr_copy[j + 1] = arr_copy[j + 1], arr_copy[j]
                step["swapped"] = True

            step["array"] = arr_copy.copy()
            steps.append(step)
            print(step)

    return {
        "steps": steps,
        "sorted_array": arr_copy
    }
