from fastapi import FastAPI, WebSocket
from web_socket import emotion_socket
from transcription_api import router as transcription_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
# https://www.youtube.com/watch?v=6qx_1NFF3J0&ab_channel=Bitfumes

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] for all origins (less secure)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Register the transcription route
app.include_router(transcription_router)

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}


@app.websocket("/ws/emotion")
async def websocket_emotion(websocket: WebSocket):
    await emotion_socket(websocket)