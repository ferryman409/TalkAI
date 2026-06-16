from abc import ABC, abstractmethod
from typing import AsyncIterator


class AbstractLLMProvider(ABC):
    @abstractmethod
    async def generate_stream(
        self,
        system_prompt: str,
        messages: list[dict],
        max_tokens: int = 1024,
        temperature: float = 0.8,
    ) -> AsyncIterator[str]:
        ...

    @abstractmethod
    async def generate_sync(
        self,
        system_prompt: str,
        messages: list[dict],
        max_tokens: int = 256,
        temperature: float = 0.3,
    ) -> str:
        ...

    @abstractmethod
    def count_tokens(self, text: str) -> int:
        ...
