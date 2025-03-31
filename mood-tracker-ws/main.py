# server.py
import asyncio
import websockets
import cv2
import numpy as np
from deepface import DeepFace
import json

# Optional: disable GPU usage if you're on CPU
import os
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'

async def handle_connection(websocket):
    print("🔌 Client connected")

    try:
        async for message in websocket:
            # Receive raw bytes (image from browser)
            img_array = np.frombuffer(message, dtype=np.uint8)
            frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

            if frame is None:
                await websocket.send(json.dumps({ "error": "Invalid image" }))
                continue

            try:
                result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
                dominant_emotion = result[0]['dominant_emotion']

                # Convert float32s to regular Python floats
                emotion_scores = {k: float(v) for k, v in result[0]['emotion'].items()}

                await websocket.send(json.dumps({
                    "dominant_emotion": dominant_emotion,
                    "full_result": emotion_scores
                }))
                print(f"✅ Emotion detected: {dominant_emotion}")

            except Exception as e:
                print(f"❌ DeepFace error: {e}")
                await websocket.send(json.dumps({ "error": str(e) }))
    except websockets.ConnectionClosed:
        print("❌ Client disconnected")

async def main():
    print("🚀 Starting WebSocket server on ws://localhost:5001")
    async with websockets.serve(handle_connection, "localhost", 5001, max_size=10_000_000):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
