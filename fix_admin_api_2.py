import os

path = "apps/web/src/lib/api/admin.ts"
with open(path, "r") as f:
    content = f.read()

# Replace ${getBase()} with /admin
content = content.replace('${getBase()}', '/admin')

# Also remove getBase definition
lines = content.split('\n')
new_lines = []
skip = False
for line in lines:
    if line.startswith('const getBase = () => {'):
        skip = True
    if skip and line == '};':
        skip = False
        continue
    if not skip:
        new_lines.append(line)

with open(path, "w") as f:
    f.write('\n'.join(new_lines))

print("Fixed admin API paths back to /admin!")
