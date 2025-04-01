import shutil
import tempfile

import whisper
from fastapi import APIRouter, File, UploadFile

from shared import add_to_vector_store, reflect_on_user

router = APIRouter()
model = whisper.load_model("base")


@router.post("/transcribe_audio")
async def transcribe_audio(audio: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        shutil.copyfileobj(audio.file, tmp)
        tmp_path = tmp.name

    result = model.transcribe(tmp_path)
    transcript = result["text"]
    add_to_vector_store(transcript, metadata={"source": "audio"})
    reflection = reflect_on_user(
        "Reflect on this new journal entry in a helpful, empathetic way."
    )
    return {"transcript": transcript, "reflection": reflection}
