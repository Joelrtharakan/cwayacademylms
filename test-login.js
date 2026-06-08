const axios = require('axios');

async function login() {
  try {
    const res = await axios.post('http://localhost:4000/api/v1/auth/login', {
      email: 'dr.reeju@cwayacademy.com',
      password: 'Instructor123!'
    });
    console.log("LOGIN SUCCESS:");
    console.log(res.data);
  } catch (err) {
    console.log("LOGIN FAILED:");
    console.log(err.response?.data || err.message);
  }
}

login();
