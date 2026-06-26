const fs = require('fs');
const file = './packages/db/prisma/schema.prisma';
let content = fs.readFileSync(file, 'utf8');

const additions = {
  Course: ["@@index([categoryId])"],
  Enrollment: ["@@index([paymentId])", "@@index([sponsorshipId])"],
  LessonProgress: ["@@index([lessonId])"],
  Quiz: ["@@index([rubricId])"],
  Answer: ["@@index([questionId])"],
  QuizAttempt: ["@@index([studentId])"],
  Assignment: ["@@index([rubricId])"],
  Submission: ["@@index([studentId])"],
  Certificate: ["@@index([studentId])", "@@index([courseId])", "@@index([programId])", "@@index([templateId])"],
  Review: ["@@index([studentId])"],
  ForumPost: ["@@index([authorId])"],
  ForumReply: ["@@index([authorId])"],
  Message: ["@@index([receiverId])"],
  Payment: ["@@index([studentId])", "@@index([courseId])"],
  Sponsorship: ["@@index([studentId])", "@@index([courseId])"],
  Coupon: ["@@index([courseId])"],
  BlogPost: ["@@index([authorId])"],
  ReadingMaterial: ["@@index([sectionId])"],
  ReadingMaterialProgress: ["@@index([readingMaterialId])"],
  Announcement: ["@@index([courseId])", "@@index([sectionId])", "@@index([authorId])"],
  Discussion: ["@@index([courseId])", "@@index([sectionId])", "@@index([lessonId])", "@@index([authorId])"],
  DiscussionReply: ["@@index([discussionId])", "@@index([authorId])"],
  Rubric: ["@@index([courseId])"],
  RubricCriteria: ["@@index([rubricId])"],
  RubricLevel: ["@@index([criteriaId])"],
  AttendanceSession: ["@@index([courseId])", "@@index([sectionId])"],
  AttendanceRecord: ["@@index([studentId])"],
  Note: ["@@index([lessonId])"],
  ProgramApplication: ["@@index([programId])"],
  ProgramEnrollment: ["@@index([programId])"]
};

for (const [modelName, indexes] of Object.entries(additions)) {
  const regex = new RegExp(`(model ${modelName} \\{[\\s\\S]*?)\n\\}`);
  const match = content.match(regex);
  if (match) {
    let block = match[1];
    for (const indexStr of indexes) {
      if (!block.includes(indexStr)) {
        block += `\n  ${indexStr}`;
      }
    }
    content = content.replace(regex, `${block}\n}`);
  }
}

fs.writeFileSync(file, content, 'utf8');
console.log('Done!');
