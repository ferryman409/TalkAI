import os
from openai import AsyncOpenAI

from app.config import settings


async def transcribe_audio(filepath: str) -> str:
    """Transcribe audio file using OpenAI Whisper API."""
    client = AsyncOpenAI(
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url or None,
    )

    with open(filepath, "rb") as f:
        response = await client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            language="zh",
        )

    return response.text
