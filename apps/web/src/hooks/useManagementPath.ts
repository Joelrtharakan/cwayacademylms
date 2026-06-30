import { useParams, usePathname } from "next/navigation";

export function useManagementPath() {
  const params = useParams();
  const pathname = usePathname();
  
  if (params?.role) {
    return `/${params.role}`;
  }
  
  // Fallback for static routes or layouts without params
  if (pathname?.startsWith("/registrar")) return "/registrar";
  if (pathname?.startsWith("/instructor")) return "/instructor";
  if (pathname?.startsWith("/student")) return "/student";
  return "/admin";
}

export function useManagementRole() {
  const params = useParams();
  const pathname = usePathname();
  
  if (params?.role === "registrar") return "REGISTRAR";
  if (params?.role === "admin") return "ADMIN";
  
  if (pathname?.startsWith("/registrar")) return "REGISTRAR";
  if (pathname?.startsWith("/instructor")) return "INSTRUCTOR";
  if (pathname?.startsWith("/student")) return "STUDENT";
  return "ADMIN";
}
