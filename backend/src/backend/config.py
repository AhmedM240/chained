from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    secret_key: str 
    access_token_days : int = 30
    cookie_secure : bool = False
    test_database_url: str | None = None

settings = Settings()  # type: ignore[call-arg]
