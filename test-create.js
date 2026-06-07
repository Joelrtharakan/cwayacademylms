const axios = require('axios');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

async function run() {
  const prisma = new PrismaClient();
  const env = fs.readFileSync('/Users/joeltharakan/Documents/cway-academy/.env', 'utf8');
  const secretLine = env.split('\n').find(l => l.startsWith('JWT_ACCESS_SECRET='));
  const secret = secretLine ? secretLine.split('=')[1].replace(/"/g, '').trim() : '';
  
  const quiz = await prisma.quiz.findFirst({
    include: { lesson: { include: { section: { include: { course: { include: { instructor: true } } } } } } }
  });
  if (!quiz) return console.log('Missing quiz');
  
  const user = quiz.lesson.section.course.instructor;
  if (!user) return console.log('Missing instructor');

  const token = jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: '1d' });
  
  try {
    const res = await axios.post(`http://localhost:4000/api/v1/quizzes/${quiz.id}/questions`, {
      text: 'Test API Still Failing',
      type: 'MCQ',
      points: 1,
      order: 0,
      answers: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('SUCCESS:', res.data);
  } catch (err) {
    if (err.response) {
      console.log('STATUS:', err.response.status);
      console.log('RESPONSE:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.log('ERROR:', err.message);
    }
  }
}
run();
