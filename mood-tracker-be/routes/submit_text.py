from fastapi import APIRouter
from pydantic import BaseModel

from shared.shared import add_to_vector_store, reflect_on_user

router = APIRouter()


class TextInput(BaseModel):
    text: str


@router.post("/submit_text")
async def submit_text(payload: TextInput):
    transcript = payload.text
    add_to_vector_store(transcript, metadata={"source": "text"})
    reflection = reflect_on_user(
        "Reflect on this new journal entry in a helpful, empathetic way."
    )
    return {"reflection": reflection}
