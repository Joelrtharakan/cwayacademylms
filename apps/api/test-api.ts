import { TokenService } from './src/services/token.service';
import axios from 'axios';

async function main() {
  const token = TokenService.generateAccessToken('cmql8quqk0000h58xt3rfj7uo', 'INSTRUCTOR');
  try {
    const res = await axios.get('http://localhost:4000/api/v1/forums/instructor/discussions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success:", res.data);
  } catch (err: any) {
    console.error("Error status:", err.response?.status);
    console.error("Error data:", err.response?.data);
  }
}
main();
