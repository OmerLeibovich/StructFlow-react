def heap_sort(array):
    steps = []
    arr_copy = array.copy()
    n = len(arr_copy)

    def record_step(i1, i2=None, swapped=False):
        highlight = [i1] if i2 is None else [i1, i2]

        if not steps or arr_copy != steps[-1]["array"] or not swapped:
            steps.append({
                "array": arr_copy.copy(),
                "highlight": highlight,
                "swapped": swapped
            })

    def heapify(n, i):
        while True:
            largest = i
            left = 2 * i + 1
            right = 2 * i + 2

            if left < n and arr_copy[left] > arr_copy[largest]:
                record_step(i, left, False)
                largest = left

            if right < n and arr_copy[right] > arr_copy[largest]:
                record_step(largest, right, False)
                largest = right

            if largest == i or arr_copy[i] == arr_copy[largest]:
                break

            arr_copy[i], arr_copy[largest] = arr_copy[largest], arr_copy[i]
            record_step(i, largest, True)

            if (2 * largest + 1 >= n and 2 * largest + 2 >= n):
                break

            i = largest
        
        
    for i in range(n // 2 - 1, -1, -1):
        heapify(n, i)

 
    for i in range(n - 1, 0, -1):
        if arr_copy[0] != arr_copy[i]:
            arr_copy[i], arr_copy[0] = arr_copy[0], arr_copy[i]
            record_step(0, i, True)
        else:
            record_step(0, i, False)
        heapify(i, 0)

    return {
        "steps": steps,
        "sorted_array": arr_copy
    }
