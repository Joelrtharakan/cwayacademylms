const fs = require('fs');
const path = require('path');

const locales = ['en', 'hi', 'ta', 'te', 'ml'];

locales.forEach(locale => {
  const filePath = path.join(__dirname, `apps/web/messages/${locale}/student.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data.student) {
      const studentData = data.student;
      delete data.student;
      const newData = { ...studentData, ...data };
      fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
      console.log(`Fixed ${locale}/student.json`);
    }
  }
});
