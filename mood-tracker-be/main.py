from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.submit_text import router as text_router
from routes.transcribe_audio import router as audio_router
from routes.transcribe_video import router as video_router
from routes.transcription_api import router as transcription_router
from web_sockets.web_socket import router as emotion_socket

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transcription_router)
app.include_router(video_router)
app.include_router(audio_router)
app.include_router(text_router)
app.include_router(emotion_socket)
