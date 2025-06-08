def quick_sort(array):
    steps = []
    arr = array.copy()

    def record_step(highlight_indices, swapped=False, comparison=None, values=None):
        steps.append({
            "array": arr.copy(),
            "highlight": highlight_indices,
            "swapped": swapped,
            "comparison": comparison,
            "values": values  # הערכים שהושוו בפועל
        })

    def median_of_three(low, high):
        mid = (low + high) // 2
        trio = [(arr[low], low), (arr[mid], mid), (arr[high], high)]
        trio.sort()
        return trio[1][1]

    def partition(low, high):
        pivot_index = median_of_three(low, high)
        pivot = arr[pivot_index]

        arr[pivot_index], arr[high] = arr[high], arr[pivot_index]
        record_step([pivot_index, high], swapped=True,
                    comparison=f"pivot swap: {arr[high]} ↔ {arr[pivot_index]}",
                    values=[arr[high], arr[pivot_index]])

        i = low - 1
        for j in range(low, high):
            if arr[j] < pivot:
                i += 1
                if i != j:
                    arr[i], arr[j] = arr[j], arr[i]
                    record_step([i, j], swapped=True,
                                comparison=f"{arr[j]} < pivot({pivot}) → True → swap {arr[i]} ↔ {arr[j]}",
                                values=[arr[i], arr[j]])
                else:
                    record_step([i, j], swapped=False,
                                comparison=f"{arr[j]} < pivot({pivot}) → True → already in position",
                                values=[arr[j], arr[j]])
            else:
                record_step([j, high], swapped=False,
                            comparison=f"{arr[j]} < pivot({pivot}) → False → no swap",
                        values=[arr[j], pivot])


        if i + 1 == high:
            record_step([i + 1, high], swapped=False,
                        comparison=f"pivot {arr[high]} is already in place",
                        values=[arr[high], arr[high]])
        else:
            arr[i + 1], arr[high] = arr[high], arr[i + 1]
            record_step([i + 1, high], swapped=True,
                        comparison=f"Moved pivot {pivot} to position {i + 1}",
                        values=[arr[i + 1], arr[high]])

        return i + 1

    def quick_sort_rec(low, high):
        if low < high:
            pi = partition(low, high)
            quick_sort_rec(low, pi - 1)
            quick_sort_rec(pi + 1, high)

    quick_sort_rec(0, len(arr) - 1)
    return {
        "steps": steps,
        "sorted_array": arr
    }
