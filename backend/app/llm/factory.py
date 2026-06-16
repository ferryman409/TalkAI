from app.llm.base import AbstractLLMProvider
from app.config import settings


_provider: AbstractLLMProvider | None = None


def get_llm_provider() -> AbstractLLMProvider:
    global _provider
    if _provider is not None:
        return _provider

    provider_name = settings.llm_provider.lower()

    if provider_name == "openai":
        from app.llm.openai_provider import OpenAIProvider
        _provider = OpenAIProvider(
            api_key=settings.openai_api_key,
            model=settings.openai_model,
            base_url=settings.openai_base_url or None,
        )
    elif provider_name == "anthropic":
        from app.llm.anthropic_provider import AnthropicProvider
        _provider = AnthropicProvider(
            api_key=settings.anthropic_api_key,
            model=settings.anthropic_model,
        )
    elif provider_name == "local":
        from app.llm.openai_provider import OpenAIProvider
        _provider = OpenAIProvider(
            api_key="ollama",
            model=settings.local_model,
        )
        _provider.client.base_url = f"{settings.local_base_url}/v1"
    else:
        raise ValueError(f"Unknown LLM provider: {provider_name}")

    return _provider
