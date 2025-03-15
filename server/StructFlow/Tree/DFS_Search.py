def DFS_Search(self, Stack, DFS_order):
    DFS_target = None
    if self.root is None:
        return Stack, DFS_order, DFS_target

    if not Stack:
        Stack.append(self.root)

    node = Stack.pop()  

    if node.key not in DFS_order:
        DFS_order.append(node.key)
        self.visited.add(node.key)
        DFS_target = node.key

    if node.right is not None and node.right.key not in self.visited:
        Stack.append(node.right)
    if node.left is not None and node.left.key not in self.visited:
        Stack.append(node.left)

    return Stack, DFS_order, DFS_target
