const fs = require('fs');
const file = '/Users/joeltharakan/Documents/cway-academy/packages/db/prisma/schema.prisma';
let code = fs.readFileSync(file, 'utf8');

// List of relations to add onDelete: Cascade
const relations = [
  'instructor   User      @relation("InstructorCourses", fields: [instructorId], references: [id])',
  'student       User      @relation(fields: [studentId], references: [id])',
  'student     User      @relation(fields: [studentId], references: [id])',
  'student      User       @relation(fields: [studentId], references: [id])',
  'student     User                 @relation(fields: [studentId], references: [id])',
  'student    User     @relation(fields: [studentId], references: [id])',
  'author    User         @relation(fields: [authorId], references: [id])',
  'author    User      @relation(fields: [authorId], references: [id])',
  'sender     User      @relation("SentMessages", fields: [senderId], references: [id])',
  'receiver   User      @relation("ReceivedMessages", fields: [receiverId], references: [id])',
  'student         User         @relation(fields: [studentId], references: [id])',
  'student         User?    @relation(fields: [studentId], references: [id])',
  'author      User     @relation(fields: [authorId], references: [id])',
  'instructor   User      @relation(fields: [instructorId], references: [id])',
  'author    User     @relation(fields: [authorId], references: [id])',
  'author    User              @relation(fields: [authorId], references: [id])',
  'author       User       @relation(fields: [authorId], references: [id])',
  'student   User              @relation(fields: [studentId], references: [id])',
  'student    User     @relation(fields: [studentId], references: [id])'
];

for (const rel of relations) {
  const newRel = rel.replace('references: [id])', 'references: [id], onDelete: Cascade)');
  code = code.replace(rel, newRel);
}

fs.writeFileSync(file, code);
console.log('Added onDelete: Cascade to schema.prisma');
