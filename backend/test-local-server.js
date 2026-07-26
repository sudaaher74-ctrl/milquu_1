import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

async function run() {
  const token = jwt.sign({ id: '6a196d50bb2cb6238c04c0d1', role: 'admin' }, 'my-very-secret-string-12345', { expiresIn: '1h' });

  try {
    const res = await fetch('http://localhost:5001/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        messages: [
          { role: 'assistant', text: "Hello! I'm your AI Business Assistant..." },
          { role: 'user', text: "give me a overview" }
        ]
      })
    });
    
    const json = await res.json();
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", json);
  } catch (e) {
    console.log("ERROR:", e);
  }
}
run();
