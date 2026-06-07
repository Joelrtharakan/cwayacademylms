const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/test', (req, res) => {
  const { answers } = req.body;
  res.json({
    type: typeof answers,
    isArray: Array.isArray(answers),
    value: answers
  });
});

const server = app.listen(0, async () => {
  const port = server.address().port;
  const res = await axios.post(`http://localhost:${port}/test`, {
    answers: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }]
  });
  console.log(res.data);
  server.close();
});
