import axios from 'axios';
async function main() {
  try {
    const res = await axios.post("http://localhost:4000/api/v1/auth/login", {
      email: "joelrtharakan@gmail.com",
      password: "password" // assuming they use a generic password or we can just see the response
    });
    console.log("Success:", res.data);
  } catch (err: any) {
    console.log("Error:", err.response?.status, err.response?.data);
  }
}
main();
