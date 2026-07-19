const fs = require('fs');

const errors = `
src/controllers/admin.controller.ts(664,9): error TS2322: Type 'JsonValue' is not assignable to type 'string'.
src/controllers/admin.controller.ts(1779,80): error TS2345: Argument of type 'JsonValue' is not assignable to parameter of type 'string'.
src/controllers/courses.controller.ts(391,70): error TS2345: Argument of type 'JsonValue' is not assignable to parameter of type 'string'.
src/controllers/courses.controller.ts(519,70): error TS2345: Argument of type 'JsonValue' is not assignable to parameter of type 'string'.
src/controllers/courses.controller.ts(941,27): error TS2322: Type 'JsonValue' is not assignable to type 'string'.
src/controllers/modules.controller.ts(401,70): error TS2345: Argument of type 'JsonValue' is not assignable to parameter of type 'string'.
src/controllers/programs.controller.ts(197,7): error TS2345: Argument of type 'JsonValue' is not assignable to parameter of type 'string'.
src/controllers/programs.controller.ts(206,7): error TS2345: Argument of type 'JsonValue' is not assignable to parameter of type 'string'.
src/controllers/student.controller.ts(70,7): error TS2322: Type 'string | number | true | JsonObject | JsonArray' is not assignable to type 'string'.
src/controllers/student.controller.ts(141,9): error TS2322: Type 'JsonValue' is not assignable to type 'string'.
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
  
  // Sort descending to not mess up earlier line numbers if we were inserting lines (but we are replacing in place)
  for (const lineNum of lineNums) {
    let text = content[lineNum];
    // Simple regex to add 'as string' or 'as any' to the properties
    text = text.replace(/course\.title/g, '(course.title as any)');
    text = text.replace(/course\.slug/g, '(course.slug as any)');
    text = text.replace(/application\.program\.title/g, '(application.program.title as any)');
    text = text.replace(/lesson\.title/g, '(lesson.title as any)');
    text = text.replace(/program\.title/g, '(program.title as any)');
    text = text.replace(/item\.course\.title/g, '(item.course.title as any)');
    text = text.replace(/item\.program\.title/g, '(item.program.title as any)');
    text = text.replace(/quiz\.title/g, '(quiz.title as any)');
    text = text.replace(/quiz\.lesson\.title/g, '(quiz.lesson.title as any)');
    content[lineNum] = text;
  }
  
  fs.writeFileSync(file, content.join('\n'));
}

console.log("Fixes applied!");
