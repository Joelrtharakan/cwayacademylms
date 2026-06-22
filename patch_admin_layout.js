const fs = require('fs');
const path = require('path');

function patchLayout(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Add Menu import if not exists
  if (!content.includes('Menu,')) {
    content = content.replace('import { Bell, Search }', 'import { Bell, Search, Menu }');
    content = content.replace('import { Bell, Search, Settings }', 'import { Bell, Search, Settings, Menu }');
  }

  // Add state for mobile menu
  content = content.replace(
    'const { user, isLoading, initAuth } = useAuthStore();',
    `const { user, isLoading, initAuth } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);`
  );

  // Pass state to Sidebar
  content = content.replace(
    /<(Admin|Instructor)Sidebar \/>/g,
    '<$1Sidebar mobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />'
  );

  // Add Hamburger Menu button to Top bar
  const hamburgerHtml = `
          {/* Mobile Hamburger Menu */}
          <button 
            className="md:hidden mr-4"
            onClick={() => setIsMobileMenuOpen(true)}
            style={{ color: "#1A261D", background: "transparent", border: "none" }}
          >
            <Menu size={24} />
          </button>
          
          {/* Search */}`;

  content = content.replace('{/* Search */}', hamburgerHtml);

  // Fix Main padding for mobile (if padding is hardcoded like padding: "32px")
  // Find <main> and replace padding
  if (content.includes('padding: "32px 36px"')) {
    content = content.replace('padding: "32px 36px",', 'padding: "clamp(16px, 4vw, 32px) clamp(16px, 5vw, 36px)",');
  } else if (content.includes('padding: "32px",')) {
    content = content.replace('padding: "32px",', 'padding: "clamp(16px, 4vw, 32px)",');
  }

  // Fix header padding for mobile
  content = content.replace('padding: "0 28px",', 'padding: "0 clamp(16px, 4vw, 28px)",');

  // Hide search bar on mobile
  content = content.replace(
    'style={{ position: "relative", width: "240px" }}',
    'className="hidden sm:block" style={{ position: "relative", width: "240px" }}'
  );

  fs.writeFileSync(file, content);
}

function patchSidebar(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Add props
  content = content.replace(
    /export default function (Admin|Instructor)Sidebar\(\) {/g,
    'export default function $1Sidebar({ mobileOpen = false, onClose = () => {} }: { mobileOpen?: boolean, onClose?: () => void }) {'
  );

  // Add mobile overlay
  const overlayHtml = `
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
`;

  content = content.replace('<>','<>\n' + overlayHtml);

  // Fix fixed sidebar position/transform
  content = content.replace(
    '        style={{',
    `        className={\`md:translate-x-0 \${mobileOpen ? "translate-x-0" : "-translate-x-full"}\`}
        style={{`
  );

  // Fix spacer
  content = content.replace(
    '<div style={{ width: `${W}px`, flexShrink: 0, transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)" }} />',
    '<div className="hidden md:block" style={{ width: `${W}px`, flexShrink: 0, transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)" }} />'
  );

  fs.writeFileSync(file, content);
}

const basePath = path.join(__dirname, 'apps/web/src/app');
patchLayout(path.join(basePath, 'admin/layout.tsx'));
patchSidebar(path.join(basePath, 'admin/AdminSidebar.tsx'));

const instructorLayoutPath = path.join(basePath, 'instructor/layout.tsx');
if (fs.existsSync(instructorLayoutPath)) {
  patchLayout(instructorLayoutPath);
}

const instructorSidebarPath = path.join(basePath, 'instructor/InstructorSidebar.tsx');
if (fs.existsSync(instructorSidebarPath)) {
  patchSidebar(instructorSidebarPath);
}
