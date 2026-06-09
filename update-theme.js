const fs = require('fs');
const file = '/Users/joeltharakan/Documents/cway-academy/apps/web/src/app/student/courses/[courseId]/learn/[lessonId]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace backgrounds
code = code.replace(/bg-\[\#1C2B1E\]/g, 'bg-[#FAFAF7]');
code = code.replace(/bg-\[\#243825\]/g, 'bg-[#FFFFFF]');

// Replace text colors
code = code.replace(/text-\[\#F5F0E8\]/g, 'text-[#1A261D]');
// Keep text-[#8A9E8C] as it is a good muted color

// Replace borders
code = code.replace(/border-\[rgba\(201,151,58,0\.2\)\]/g, 'border-[#E4E8E0]');
code = code.replace(/border-\[rgba\(201,151,58,0\.15\)\]/g, 'border-[#E4E8E0]');
code = code.replace(/border-\[rgba\(201,151,58,0\.1\)\]/g, 'border-[#E4E8E0]');

// Replace specific small elements
code = code.replace(/bg-\[rgba\(255,255,255,0\.02\)\]/g, 'bg-[#F7F8F5]');
code = code.replace(/bg-\[rgba\(255,255,255,0\.03\)\]/g, 'bg-[#F7F8F5]');
code = code.replace(/border-\[rgba\(255,255,255,0\.05\)\]/g, 'border-[#E4E8E0]');

fs.writeFileSync(file, code);
console.log('Updated theme in page.tsx');
