class TreeNode:
    def __init__(self, key, parent=None):
        self.key = key
        self.left = None
        self.right = None
        self.height = 1
        self.parent = parent
