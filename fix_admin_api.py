import os
import re

path = "apps/web/src/lib/api/admin.ts"
with open(path, "r") as f:
    content = f.read()

# Replace ${BASE} with ${getBase()}
content = content.replace('${BASE}', '${getBase()}')
content = content.replace('const BASE = getBase();\n', '')

with open(path, "w") as f:
    f.write(content)
print("Done fixing BASE in admin.ts!")
