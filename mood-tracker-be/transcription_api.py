from fastapi import APIRouter, File, UploadFile
import whisper
import tempfile
import shutil
import os

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.schema import HumanMessage
import chromadb
from dotenv import load_dotenv

# Load .env file
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

# Setup
router = APIRouter()
model = whisper.load_model("base")
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(name="mood_entries")

embedder = OpenAIEmbeddings(openai_api_key=openai_api_key)
llm = ChatOpenAI(openai_api_key=openai_api_key, model="gpt-3.5-turbo")

def add_to_vector_store(text: str, metadata: dict = None, entry_id: str = None):
    embedding = embedder.embed_query(text)
    collection.add(
        documents=[text],
        embeddings=[embedding],
        metadatas=[metadata or {}],
        ids=[entry_id or f"entry_{collection.count()}"]
    )

def reflect_on_user(prompt: str):
    query_embedding = embedder.embed_query(prompt)
    results = collection.query(query_embeddings=[query_embedding], n_results=3)
    context = "\n---\n".join(results["documents"][0])

    messages = [
        HumanMessage(content=f"Context from user's past entries:\n{context}\n\nNow respond to this prompt: {prompt}")
    ]
    response = llm(messages)
    return response.content

@router.post("/transcribe")
async def transcribe_video(video: UploadFile = File(...)):
    # Save video to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        shutil.copyfileobj(video.file, tmp)
        tmp_path = tmp.name

    # Transcribe using Whisper
    result = model.transcribe(tmp_path)
    transcript = result["text"]

    # Add to vector store
    add_to_vector_store(transcript, metadata={"source": "video-upload"})

    # Reflect on the latest entry
    chat_response = reflect_on_user("Reflect on this new journal entry in a helpful, empathetic way.")

    return {
        "transcript": transcript,
        "reflection": chat_response
    }
