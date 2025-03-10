def DFS_Search(self, Stack, DFS_order):
    target = None
    if self.root is None:
        return Stack, DFS_order, target
    if not Stack:
        Stack.append(self.root)
    node = Stack[-1]

    if node.key not in DFS_order:
        DFS_order.append(node.key)
        self.visited.add(node.key)
        target = node.key

    should_pop = True
    if node.right is not None and node.right.key not in DFS_order:
        Stack.append(node.right)
        should_pop = False
        if node.left is not None and node.left.key not in DFS_order:
            Stack.append(node.left)
            should_pop = False
    elif node.left is not None and node.left.key not in DFS_order:
        Stack.append(node.left)
        should_pop = False
    if should_pop:
        Stack.pop()
        if node.key in DFS_order and node.parent in DFS_order:
            Stack.pop()

    return Stack, DFS_order, target
