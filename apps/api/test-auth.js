const axios = require('axios');
const API = 'http://localhost:4000/api/v1';

async function test() {
  try {
    const loginRes = await axios.post(`${API}/auth/login`, {
      email: 'joelrtharakan@gmail.com',
      password: 'password123' // assuming this is the password, or I can just use the db to set it
    });
    console.log("Login:", loginRes.data);
  } catch (err) {
    console.log("Login err:", err.response ? err.response.data : err.message);
  }
}
test();
