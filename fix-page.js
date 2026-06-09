const fs = require('fs');
const file = '/Users/joeltharakan/Documents/cway-academy/apps/web/src/app/student/courses/[courseId]/learn/[lessonId]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Fix TEXT lesson specific colors
code = code.replace(/bg-\[\#F5F0E8\]/g, 'bg-[#FAFAF7]');
code = code.replace(/text-\[\#1C2B1E\]/g, 'text-[#1A261D]');
code = code.replace(/text-\[\#1C2B1E\]\/80/g, 'text-[#1A261D]/80');
code = code.replace(/border-\[rgba\(28,43,30,0\.1\)\]/g, 'border-[#E4E8E0]');
code = code.replace(/border-\[rgba\(28,43,30,0\.08\)\]/g, 'border-[#E4E8E0]');
code = code.replace(/border-\[rgba\(28,43,30,0\.05\)\]/g, 'border-[#E4E8E0]');
code = code.replace(/border-\[rgba\(28,43,30,0\.15\)\]/g, 'border-[#E4E8E0]');

fs.writeFileSync(file, code);
console.log("Fixed page.tsx");
