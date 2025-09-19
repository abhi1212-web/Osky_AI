export async function sendMessage(message: string) {
  const response = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error(`Backend error: ${response.status}`);
  const data = await response.json();
  return data.reply;
}
