const axios = require('axios');
const API = 'http://localhost:4000/api/v1';

async function test() {
  try {
    const loginRes = await axios.post(`${API}/auth/login`, {
      email: 'joelrtharakan@gmail.com',
      password: 'password123'
    });
    console.log("Login User Role:", loginRes.data.user.role);
    
    const meRes = await axios.get(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${loginRes.data.accessToken}` }
    });
    console.log("Me User Role:", meRes.data.user.role);
  } catch (err) {
    console.log("err:", err.response ? err.response.data : err.message);
  }
}
test();
