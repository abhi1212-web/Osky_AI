// src/services/api.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:8080"; // or http://172.30.1.120:8080 if running on LAN

export const sendMessageToOSKY = async (message: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/chat`, { message });
    return response.data; // { reply: "OSKY received: ..." }
  } catch (error) {
    console.error("❌ Error connecting to OSKY backend:", error);
    return { reply: "⚠️ Error connecting to OSKY backend." };
  }
};
