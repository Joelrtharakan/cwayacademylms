import os
import re

directory = "apps/web/src/app/(management)/[role]"
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            path = os.path.join(root, file)
            with open(path, "r") as f:
                content = f.read()
            
            if 'basePath' in content and 'useManagementPath' not in content:
                print(f"Missing useManagementPath in {path}")
                # We need to manually fix these
