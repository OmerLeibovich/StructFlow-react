# def heap_sort(array):
#     steps = []
#     arr = array.copy()
#     n = len(arr)

#     def record_step(i1, i2):
#         if not steps or arr != steps[-1]["array"]:
#             steps.append({
#                 "array": arr.copy(),
#                 "highlight": [i1, i2],
#                 "swapped": True
#             })
#             print(arr, "yes")

#     def heapify(size, root):
#         largest = root
#         left = 2 * root + 1
#         right = 2 * root + 2

#         if left < size and arr[left] > arr[largest]:
#             largest = left
#         if right < size and arr[right] > arr[largest]:
#             largest = right

#         if largest != root:
#             arr[root], arr[largest] = arr[largest], arr[root]
#             record_step(root, largest)
#             heapify(size, largest)

#     for i in range(n // 2 - 1, -1, -1):
#         heapify(n, i)

#     for end in range(n - 1, 0, -1):
#         arr[0], arr[end] = arr[end], arr[0]
#         record_step(0, end)
#         heapify(end, 0)

#     return {
#         "steps": steps,
#         "sorted_array": arr
#     }
