import fetch from 'node-fetch';

async function run() {
  try {
    const res = await fetch('http://localhost:5001/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer ' + token // We need a valid token for protect and admin middleware
      },
      body: JSON.stringify({
        messages: [
          { role: 'assistant', text: "Hello! I'm your AI Business Assistant..." },
          { role: 'user', text: "give me a overview" }
        ]
      })
    });
    
    const text = await res.text();
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", text);
  } catch (e) {
    console.log("ERROR:", e);
  }
}
run();
