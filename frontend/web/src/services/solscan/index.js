
import 'dotenv/config';

const requestOptions = {
  method: "get",
  headers: {"token": process.env.SOLSCAN_API_KEY},
}

fetch("https://pro-api.solscan.io/v2.0/monitor/usage", requestOptions)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));
    
