import os
import re

directory = "apps/web/src/app/(management)/[role]"
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            path = os.path.join(root, file)
            with open(path, "r") as f:
                content = f.read()
            
            # Replace: `${basePath}/programs"  -> `${basePath}/programs`
            # And: href=`${basePath}/courses" -> href={`${basePath}/courses`}
            
            # Fix 1: api.get(`${basePath}/categories").then... -> api.get(`${basePath}/categories`).then...
            content = re.sub(r'(`\$\{basePath\}[^`"]*)"', r'\1`', content)
            
            # Fix 2: href=`${basePath}...` -> href={`${basePath}...`}
            content = re.sub(r'href=`(\$\{basePath\}[^`]+)`', r'href={\1}', content)
            
            # Fix 3: any remaining href=`${basePath}..." -> href={`${basePath}...`}
            content = re.sub(r'href=`(\$\{basePath\}[^"]+)"', r'href={\1}', content)

            with open(path, "w") as f:
                f.write(content)
print("Done fixing quotes!")
