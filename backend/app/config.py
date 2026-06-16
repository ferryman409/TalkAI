from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    llm_provider: str = "openai"
    openai_api_key: str = ""
    openai_base_url: str = ""
    openai_model: str = "gpt-4o-mini"
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-20250514"
    local_model: str = "llama3:8b"
    local_base_url: str = "http://localhost:11434"

    upload_dir: str = "./uploads"
    database_url: str = "sqlite+aiosqlite:///./roleplay.db"
    encryption_key: str = ""

    host: str = "0.0.0.0"
    port: int = 8000

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
