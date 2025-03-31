# 🎭 Mood Tracker AI – FastAPI Backend

This is a FastAPI backend with a WebSocket endpoint that receives webcam frames, analyzes user emotions using DeepFace, and sends back the dominant emotion.

---

## 🧰 Requirements

- Python 3.9 or higher
- `virtualenv` (recommended)

---

## 📦 Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/your-username/mood-tracker-ai.git
cd mood-tracker-ai/mood-tracker-be
```

### 2. Create a virtual environment

```bash
python3 -m venv .venv
```

### 3. Activate the virtual environment

```bash
source .venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

---

## 🚀 Run the FastAPI server

```bash
python3 -m uvicorn main:app --reload
```

- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- WebSocket endpoint: `ws://localhost:8000/ws/emotion`

---

## 🧪 API Endpoints

| Method | Endpoint         | Description        |
|--------|------------------|--------------------|
| GET    | `/`              | Root check         |
| GET    | `/hello/{name}`  | Returns a greeting |
| WS     | `/ws/emotion`    | Receives image bytes & returns emotion analysis |

---

## 🎥 How It Works

1. The frontend captures webcam frames every second.
2. It sends the frames (as raw JPEG bytes) via WebSocket to `/ws/emotion`.
3. The backend decodes the image and uses `DeepFace` to analyze emotions.
4. The backend responds with the dominant emotion and confidence breakdown.

---

## 🧹 Resetting Your Environment (Optional)

If you want to start from scratch:

```bash
deactivate
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## ✨ Tools Used

- [FastAPI](https://fastapi.tiangolo.com/)
- [DeepFace](https://github.com/serengil/deepface)
- [Uvicorn](https://www.uvicorn.org/) – ASGI server
- [OpenCV](https://opencv.org/) – image processing
- [NumPy](https://numpy.org/) – image data handling

---

## 📂 Project Structure

```
mood-tracker-be/
│
├── main.py               # FastAPI app entry point with routes
├── emotion_ws.py         # WebSocket logic for emotion detection
├── requirements.txt      # Python dependencies
└── README.md             # You're here :)
```

---

## 🤝 Contributing

Pull requests are welcome! If you have ideas to improve emotion tracking or want to collaborate, let's build something cool together. 😎

---

## 📃 License

MIT © [Your Name]
