def counting_sort(array):
    steps = []
    arr_copy = array.copy()
    max_val = max(arr_copy)
    min_val = min(arr_copy)
    range_of_elements = max_val - min_val + 1

    count = [0] * range_of_elements
    sorted_array = [0] * len(arr_copy)

    # Count occurrences
    for i, num in enumerate(arr_copy):
        count[num - min_val] += 1
        steps.append({
            "highlight": [i],
            "type": "count",
            "description": f"Counting: {num} → count[{num - min_val}] = {count[num - min_val]}",
            "array": arr_copy.copy(),
            "count_array": count.copy()
            
        })

    # Cumulative count
    for i in range(1, range_of_elements):
        count[i] += count[i - 1]
    steps.append({
        "highlight": list(range(len(count))),
        "type": "cumulative",
        "description": "Cumulative count array ready",
        "array": arr_copy.copy(),
        "count_array": count.copy()
    })

    # Placement
    for i in range(len(arr_copy) - 1, -1, -1):
        num = arr_copy[i]
        idx = count[num - min_val] - 1
        sorted_array[idx] = num
        count[num - min_val] -= 1
        print(sorted_array)
        steps.append({
            "highlight": [idx],
            "type": "placement",
            "description": f"Placing {num} at index {idx}",
            "array": sorted_array.copy(),
            "count_array": count.copy(), 
        })


    

    return {
        "steps": steps,
        "sorted_array": sorted_array
    }
