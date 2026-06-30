import os
import re

directory = "apps/web/src/app/(management)/[role]"
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            path = os.path.join(root, file)
            with open(path, "r") as f:
                content = f.read()
            
            # If the file starts with the import, but has "use client" later...
            if content.startswith('import { useManagementPath }') and '"use client"' in content:
                # Remove the import from the top
                content = content.replace('import { useManagementPath } from "@/hooks/useManagementPath";\n', '')
                
                # And insert it after "use client";
                content = re.sub(r'("use client";?\n)', r'\1\nimport { useManagementPath } from "@/hooks/useManagementPath";\n', content)
                
                with open(path, "w") as f:
                    f.write(content)
                    
print("Fixed use client imports!")
