import os
import re

directory = "apps/web/src/app/(management)/[role]"
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            path = os.path.join(root, file)
            with open(path, "r") as f:
                content = f.read()
            
            # Replace /admin/ in api calls with ${basePath}/
            content = re.sub(r'api\.(get|post|put|delete|patch)\([`\'"]/admin/', r'api.\1(`${basePath}/', content)
            # Fix the ending quote if it was a single/double quote to backtick
            content = re.sub(r'(api\.(?:get|post|put|delete|patch)\(`\$\{basePath\}/[^`\'"]+)[\'"]', r'\1`', content)

            # Replace hardcoded href="/admin/..." with href={`${basePath}/...`}
            content = re.sub(r'href=[\'"]/admin/([^\'"]*)[\'"]', r'href={`${basePath}/\1`}', content)
            
            # Replace router.push("/admin/...") with router.push(`${basePath}/...`)
            content = re.sub(r'router\.push\([\'"]/admin/([^\'"]*)[\'"]\)', r'router.push(`${basePath}/\1`)', content)

            with open(path, "w") as f:
                f.write(content)
print("Done fixing API and routing paths!")
