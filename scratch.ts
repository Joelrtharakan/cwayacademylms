const calculateCourseGrade = async (courseId: string, studentId: string) => {
  // 1. Find all graded items in this course
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { sections: { include: { lessons: { include: { assignment: true, quiz: true } } } } }
  });
  if (!course) return 0;

  const gradedItems: { id: string, type: string, maxScore: number, sectionTitle: string }[] = [];
  course.sections.forEach(sec => {
    sec.lessons.forEach(lesson => {
      if (lesson.assignment) {
        gradedItems.push({ id: lesson.assignment.id, type: "ASSIGNMENT", maxScore: lesson.assignment.maxScore, sectionTitle: sec.title });
      }
      if (lesson.quiz) {
        gradedItems.push({ id: lesson.quiz.id, type: "QUIZ", maxScore: 100, sectionTitle: sec.title });
      }
      if (lesson.type === "FORUM") {
        gradedItems.push({ id: lesson.id, type: "FORUM", maxScore: lesson.forumMarks || 100, sectionTitle: sec.title });
      }
    });
  });

  // 2. Fetch student's grades
  const submissions = await prisma.submission.findMany({ where: { studentId, assignment: { lesson: { section: { courseId } } } } });
  const quizAttempts = await prisma.quizAttempt.findMany({ where: { studentId, quiz: { lesson: { section: { courseId } } } } });
  const forumIds = gradedItems.filter(i => i.type === "FORUM").map(i => i.id);
  const forumDiscussions = await prisma.discussion.findMany({ where: { lessonId: { in: forumIds }, authorId: studentId, score: { not: null } } });

  const grades: Record<string, number | null> = {};
  gradedItems.forEach(item => grades[item.id] = null);

  submissions.forEach(sub => { if (sub.grade !== null && sub.grade !== undefined) grades[sub.assignmentId] = sub.grade; });
  quizAttempts.forEach(qa => { if (grades[qa.quizId] === null || qa.score > grades[qa.quizId]!) grades[qa.quizId] = qa.score; });
  forumDiscussions.forEach(sf => { if (sf.lessonId && (grades[sf.lessonId] === null || sf.score! > grades[sf.lessonId]!)) grades[sf.lessonId] = sf.score!; });

  let totalEarned = 0;
  let totalMaxGraded = 0;

  gradedItems.forEach(item => {
    const score = grades[item.id];
    if (score !== null && score !== undefined) {
      totalEarned += score;
      totalMaxGraded += item.maxScore;
    }
  });

  return totalMaxGraded > 0 ? Number(((totalEarned / totalMaxGraded) * 100).toFixed(1)) : 0;
};
