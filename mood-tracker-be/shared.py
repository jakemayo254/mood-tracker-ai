import os

import chromadb
from dotenv import load_dotenv
from langchain.schema import HumanMessage
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

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
        ids=[entry_id or f"entry_{collection.count()}"],
    )


def reflect_on_user(prompt: str):
    query_embedding = embedder.embed_query(prompt)
    results = collection.query(query_embeddings=[query_embedding], n_results=3)
    context = "\n---\n".join(results["documents"][0])

    messages = [
        HumanMessage(
            content=f"Context from user's past entries:\n{context}\n\nNow respond to this prompt: {prompt}"
        )
    ]
    return llm(messages).content
