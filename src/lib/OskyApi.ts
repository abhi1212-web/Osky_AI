// src/lib/oskyApi.ts
export interface ChatResponse {
  reply: string;
}

export async function sendMessageToOSKY(message: string): Promise<ChatResponse> {
  try {
    const response = await fetch("http://localhost:5001/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status} ${response.statusText}`);
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (err) {
    console.error("Error sending message to OSKY:", err);
    return { reply: "Sorry, I couldn't reach OSKY. Please try again." };
  }
}
