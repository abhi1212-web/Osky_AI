from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow React frontend to access backend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # frontend URLs
    allow_credentials=True,
    allow_methods=["*"],        # all HTTP methods
    allow_headers=["*"],        # all headers
)

# Request model
class ChatRequest(BaseModel):
    message: str

# Chat endpoint
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    user_message = request.message
    # Replace this with your OSKY AI logic later
    reply = f"OSKY AI: You said '{user_message}'"
    return {"reply": reply}

# Run backend:
# uvicorn main:app --reload --port 8080
