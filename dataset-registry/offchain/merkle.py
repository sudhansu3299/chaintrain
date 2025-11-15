import hashlib

def chunk_file(path, chunk_size=1024 * 1024):
  with open(path, "rb") as f:
    while True:
      chunk = f.read(chunk_size)
      if not chunk:
        break
      yield chunk

def hash(data: bytes):
  return hashlib.sha256(data).digest()

def build_merkle(chunks):
  leaves = [hash(c) for c in chunks]
  if len(leaves) == 1:
    return leaves[0], [leaves[0]]

  level = leaves
  tree = [level]

  while len(level) > 1:
    next_level = []
    for i in range(0, len(level), 2):
      left = level[i]
      right = level[i + 1] if i + 1 < len(level) else left
      parent = hash(left + right)
      next_level.append(parent)
    level = next_level
    tree.append(level)

  root = tree[-1][0]
  return root, tree
