const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/web/src/app/student/StudentSidebar.tsx');
let content = fs.readFileSync(file, 'utf8');

// Add props
content = content.replace(
  'export default function StudentSidebar() {',
  'export default function StudentSidebar({ mobileOpen = false, onClose = () => {} }: { mobileOpen?: boolean, onClose?: () => void }) {'
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

// Fix fixed sidebar
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
