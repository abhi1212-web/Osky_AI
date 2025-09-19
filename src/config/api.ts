// API Configuration
// Connected to your Replit FastAPI backend
export const API_CONFIG = {
  BASE_URL: 'https://8f5a60f1-099b-4e30-9b1d-edfb12120d04-00-eccqlfxd9oqv.janeway.replit.dev',
  ENDPOINTS: {
    HEALTH: '/health',
    CHAT: '/chat',
    CHATS: '/chats',
    MESSAGES: '/messages',
  },
  TIMEOUT: 10000, // 10 seconds
};

// Instructions for connecting your FastAPI backend:
//
// 1. Make sure your FastAPI backend has the following endpoints:
//    - GET /health - Health check endpoint
//    - POST /chat - Send message and get AI response
//    - GET /chats - Get all chat sessions
//    - GET /chats/{chat_id}/messages - Get messages for a specific chat
//    - POST /chats - Create new chat session
//    - DELETE /chats/{chat_id} - Delete chat
//    - PATCH /chats/{chat_id}/pin - Toggle pin status
//
// 2. Enable CORS in your FastAPI app to allow requests from this frontend
//
// Example FastAPI CORS setup:
// from fastapi.middleware.cors import CORSMiddleware
// app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
