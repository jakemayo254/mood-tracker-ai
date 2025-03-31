# transcription_api.py

from fastapi import APIRouter, File, UploadFile
import whisper
import tempfile
import shutil

router = APIRouter()
model = whisper.load_model("base")

@router.post("/transcribe")
async def transcribe_video(video: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        shutil.copyfileobj(video.file, tmp)
        tmp_path = tmp.name

    result = model.transcribe(tmp_path)
    return {"transcript": result["text"]}
