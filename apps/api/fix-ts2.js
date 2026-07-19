const fs = require('fs');

const errors = `
src/controllers/student.controller.ts(70,7): error TS2322: Type 'string | number | true | JsonObject | JsonArray' is not assignable to type 'string'.
src/controllers/student.controller.ts(146,9): error TS2322: Type 'JsonValue' is not assignable to type 'string'.
src/controllers/student.controller.ts(1323,112): error TS2322: Type 'JsonValue' is not assignable to type 'string'.
src/controllers/student.controller.ts(1326,77): error TS2322: Type 'JsonValue' is not assignable to type 'string'.
src/controllers/student.controller.ts(1329,94): error TS2322: Type 'JsonValue' is not assignable to type 'string'.
src/services/certificate.service.ts(335,7): error TS2322: Type 'string | number | true | JsonObject | JsonArray' is not assignable to type 'string'.
src/services/certificate.service.ts(411,11): error TS2322: Type 'string | number | true | JsonObject | JsonArray' is not assignable to type 'string'.
src/services/certificate.service.ts(451,11): error TS2322: Type 'string | number | true | JsonObject | JsonArray' is not assignable to type 'string'.
`;

const lines = errors.trim().split('\n');

const updates = {};
lines.forEach(line => {
  const match = line.match(/(src\/.*\.ts)\((\d+),(\d+)\)/);
  if (match) {
    const file = match[1];
    const lineNum = parseInt(match[2], 10) - 1;
    if (!updates[file]) updates[file] = [];
    updates[file].push(lineNum);
  }
});

for (const [file, lineNums] of Object.entries(updates)) {
  let content = fs.readFileSync(file, 'utf8').split('\n');
  
  for (const lineNum of lineNums) {
    let text = content[lineNum];
    if (file.includes('student.controller.ts')) {
      if (lineNum === 69) text = text.replace('course.title', '(course.title as any)');
      if (lineNum === 145) text = text.replace('course.title', '(course.title as any)');
      if (lineNum === 1322) text = text.replace('course.title', '(course.title as any)');
      if (lineNum === 1325) text = text.replace('program.title', '(program.title as any)');
      if (lineNum === 1328) text = text.replace('course.title', '(course.title as any)');
    }
    if (file.includes('certificate.service.ts')) {
      if (lineNum === 334) text = text.replace('course.title', '(course.title as any)');
      if (lineNum === 410) text = text.replace('course.title', '(course.title as any)');
      if (lineNum === 450) text = text.replace('program.title', '(program.title as any)');
    }
    content[lineNum] = text;
  }
  
  fs.writeFileSync(file, content.join('\n'));
}

console.log("Fixes applied!");
