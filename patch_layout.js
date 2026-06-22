const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/web/src/app/student/layout.tsx');
let content = fs.readFileSync(file, 'utf8');

// Add Menu import if not exists
if (!content.includes('Menu,')) {
  content = content.replace('import { Bell, Search, Check, X }', 'import { Bell, Search, Check, X, Menu }');
}

// Add state for mobile menu
content = content.replace(
  'const { user, isLoading, initAuth } = useAuthStore();',
  `const { user, isLoading, initAuth } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);`
);

// Pass state to StudentSidebar
content = content.replace(
  '<StudentSidebar />',
  '<StudentSidebar mobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />'
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

// Fix Main padding for mobile
content = content.replace(
  'padding: "32px 36px",',
  'padding: "clamp(16px, 4vw, 32px) clamp(16px, 5vw, 36px)",'
);

// Fix header padding for mobile
content = content.replace(
  'padding: "0 28px",',
  'padding: "0 clamp(16px, 4vw, 28px)",'
);

// Hide search bar on mobile or make it responsive
content = content.replace(
  'style={{ position: "relative", width: "240px" }}',
  'className="hidden sm:block" style={{ position: "relative", width: "240px" }}'
);

fs.writeFileSync(file, content);
