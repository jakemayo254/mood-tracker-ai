from fastapi import FastAPI, WebSocket
from web_socket import handle_connection


app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}


@app.websocket("/ws/emotion")
async def websocket_emotion(websocket: WebSocket):
    await handle_connection(websocket)