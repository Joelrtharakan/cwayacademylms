#!/bin/bash
pages=(
  "apps/web/src/app/instructor/revenue/page.tsx"
  "apps/web/src/app/instructor/courses/[id]/analytics/page.tsx"
  "apps/web/src/app/instructor/dashboard/page.tsx"
  "apps/web/src/app/registrar/analytics/page.tsx"
  "apps/web/src/app/admin/analytics/page.tsx"
  "apps/web/src/app/student/dashboard/page.tsx"
  "apps/web/src/app/registrar/dashboard/page.tsx"
  "apps/web/src/app/admin/dashboard/page.tsx"
)

for file in "${pages[@]}"; do
  dir=$(dirname "$file")
  mv "$file" "$dir/ClientPage.tsx"
  cat << 'INNER_EOF' > "$file"
import dynamic from "next/dynamic";

const ClientPage = dynamic(() => import("./ClientPage"), { ssr: false });

export default function Page(props: any) {
  return <ClientPage {...props} />;
}
INNER_EOF
done
