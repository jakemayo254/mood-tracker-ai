from fastapi import APIRouter, UploadFile, File
import tempfile, shutil
import whisper
from shared import add_to_vector_store, reflect_on_user

router = APIRouter()
model = whisper.load_model("base")

@router.post("/transcribe_video")
async def transcribe_video(video: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        shutil.copyfileobj(video.file, tmp)
        tmp_path = tmp.name

    result = model.transcribe(tmp_path)
    transcript = result["text"]
    add_to_vector_store(transcript, metadata={"source": "video"})
    reflection = reflect_on_user("Reflect on this new journal entry in a helpful, empathetic way.")
    return {"transcript": transcript, "reflection": reflection}
