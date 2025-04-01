import os

import cv2
import numpy as np
from deepface import DeepFace
from fastapi import APIRouter, WebSocket

router = APIRouter()

os.environ["CUDA_VISIBLE_DEVICES"] = "-1"


@router.websocket("/ws/emotion")
async def emotion_socket(websocket: WebSocket):
    await websocket.accept()
    print("🔌 Client connected")

    try:
        while True:
            # FastAPI WebSocket uses `.receive_bytes()` instead of `async for`
            message = await websocket.receive_bytes()

            img_array = np.frombuffer(message, dtype=np.uint8)
            frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

            if frame is None:
                await websocket.send_json({"error": "Invalid image"})
                continue

            try:
                result = DeepFace.analyze(
                    frame, actions=["emotion"], enforce_detection=False
                )
                dominant_emotion = result[0]["dominant_emotion"]
                emotion_scores = {k: float(v) for k, v in result[0]["emotion"].items()}

                await websocket.send_json(
                    {
                        "dominant_emotion": dominant_emotion,
                        "full_result": emotion_scores,
                    }
                )
                print(f"✅ Emotion detected: {dominant_emotion}")

            except Exception as e:
                print(f"❌ DeepFace error: {e}")
                await websocket.send_json({"error": str(e)})

    except Exception as e:
        print(f"❌ WebSocket closed or error: {e}")
