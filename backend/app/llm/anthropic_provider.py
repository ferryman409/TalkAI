from typing import AsyncIterator

from anthropic import AsyncAnthropic

from app.llm.base import AbstractLLMProvider


class AnthropicProvider(AbstractLLMProvider):
    def __init__(self, api_key: str, model: str):
        self.client = AsyncAnthropic(api_key=api_key)
        self.model = model

    async def generate_stream(
        self,
        system_prompt: str,
        messages: list[dict],
        max_tokens: int = 1024,
        temperature: float = 0.8,
    ) -> AsyncIterator[str]:
        user_messages = []
        for m in messages:
            user_messages.append({"role": m["role"], "content": m["content"]})

        async with self.client.messages.stream(
            model=self.model,
            system=system_prompt,
            messages=user_messages,
            max_tokens=max_tokens,
            temperature=temperature,
        ) as stream:
            async for text in stream.text_stream:
                yield text

    async def generate_sync(
        self,
        system_prompt: str,
        messages: list[dict],
        max_tokens: int = 256,
        temperature: float = 0.3,
    ) -> str:
        user_messages = []
        for m in messages:
            user_messages.append({"role": m["role"], "content": m["content"]})

        response = await self.client.messages.create(
            model=self.model,
            system=system_prompt,
            messages=user_messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        if response.content and len(response.content) > 0:
            return response.content[0].text
        return ""

    def count_tokens(self, text: str) -> int:
        return len(text) // 3
