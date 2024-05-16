import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.environ.get("ENV_FILE", "test.env"),
        env_file_encoding="utf-8",
    )

    port: int = 3001
    db_dir: str = "."
    thumbnail_size_x: int = 140
    thumbnail_size_y: int = 600
    origins: list[str] = ["*"]


SETTINGS = Settings()
