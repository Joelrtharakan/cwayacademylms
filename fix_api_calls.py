import os
import re

directory = "apps/web/src/app/(management)/[role]"
count = 0
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            path = os.path.join(root, file)
            with open(path, "r") as f:
                content = f.read()
            
            # Replace: api.get(`${basePath}/applications`) with api.get(`/admin/applications`)
            # And for post, put, delete, patch as well.
            
            new_content = re.sub(r'api\.(get|post|put|delete|patch)\(`\$\{basePath\}/', r'api.\1(`/admin/', content)
            
            if new_content != content:
                with open(path, "w") as f:
                    f.write(new_content)
                count += 1
                
print(f"Fixed API calls in {count} files!")
