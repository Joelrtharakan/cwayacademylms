import os
import re

directory = "apps/web/src/app/(management)/[role]"
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            path = os.path.join(root, file)
            with open(path, "r") as f:
                content = f.read()
            
            # Replace `/admin/...` with `${basePath}/...`
            # But wait, what if basePath is not defined in the scope?
            # It's better to just check if `const basePath = useManagementPath();` exists in the file, and if not, add it.
            # However, looking at the files:
            # - blog/page.tsx: basePath exists
            # - programs/[id]/students/[studentId]/page.tsx: basePath exists
            # - programs/[id]/_components/ProgramStudents.tsx: might not exist!
            # - programs/[id]/page.tsx: basePath exists
            # - programs/page.tsx: basePath might not exist! Wait, it has Link.
            
            content = re.sub(r'`/admin/([^`]*)`', r'`${basePath}/\1`', content)
            
            with open(path, "w") as f:
                f.write(content)
print("Done fixing backticks!")
