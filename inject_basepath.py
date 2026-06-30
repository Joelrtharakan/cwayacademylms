import re

def fix_file(path, component_names):
    with open(path, "r") as f:
        content = f.read()

    if "useManagementPath" not in content:
        content = 'import { useManagementPath } from "@/hooks/useManagementPath";\n' + content

    for comp in component_names:
        # Match `function Comp(`, `const Comp = (`, `export default function Comp(`
        # and insert `const basePath = useManagementPath();` right after `{`
        pattern = r'(function\s+' + comp + r'\s*\([^)]*\)\s*\{|const\s+' + comp + r'\s*=\s*\([^)]*\)\s*=>\s*\{)'
        content = re.sub(pattern, r'\1\n  const basePath = useManagementPath();', content)
        
    with open(path, "w") as f:
        f.write(content)

fix_file("apps/web/src/app/(management)/[role]/programs/[id]/students/[studentId]/page.tsx", ["ProgramStudentDetailsPage"])
fix_file("apps/web/src/app/(management)/[role]/programs/[id]/_components/ProgramStudents.tsx", ["ProgramStudents"])
fix_file("apps/web/src/app/(management)/[role]/users/page.tsx", ["AdminUsersPage"])
fix_file("apps/web/src/app/(management)/[role]/users/[id]/page.tsx", ["AdminUserViewPage"])
print("Injected basePath!")
