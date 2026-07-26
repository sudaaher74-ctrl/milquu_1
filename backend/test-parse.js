const rawText = "```json\n{\n  \"reply\": \"Hi Sudarshan\",\n  \"action\": \"none\"\n}\n```";
console.log("Raw:");
console.log(rawText);

let parsed;
try {
  const cleaned = rawText.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  console.log("Cleaned:", cleaned);
  parsed = JSON.parse(cleaned);
  console.log("Parsed reply:", parsed.reply);
} catch (e) {
  console.log("Error:", e.message);
}
