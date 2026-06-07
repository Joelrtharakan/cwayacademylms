const { PrismaClient } = require('@prisma/client');

async function run() {
  const prisma = new PrismaClient();
  
  const quiz = await prisma.quiz.findFirst();
  if (!quiz) return console.log('NO QUIZ');
  
  const answers = [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }];
  
  try {
    const question = await prisma.question.create({
      data: {
        quizId: quiz.id,
        text: 'Test Prisma',
        type: 'MCQ',
        points: 1,
        order: 0,
        scriptureRef: undefined,
        answers: answers && answers.length > 0 ? {
          create: answers.map((a) => ({
            text: a.text,
            isCorrect: Boolean(a.isCorrect)
          }))
        } : undefined
      },
      include: { answers: true }
    });
    console.log('SUCCESS:', question.id);
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}
run();
