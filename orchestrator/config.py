import logging
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    redis_url: str = ""
    mesh_master_secret: str = ""
    admin_dashboard_key: str = ""
    llm_api_key: str = ""
    llm_base_url: str = "https://generativelanguage.googleapis.com/v1beta/openai"
    planner_model: str = "gemini-2.5-flash"
    containerizer_model: str = "gemini-2.5-flash"
    recovery_model: str = "gemini-2.5-flash"
    dockerhub_username: str = ""
    dockerhub_token: str = ""
    github_token: str = ""
    e2b_api_key: str = ""
    e2b_template: str = ""
    host_floor_min_mb: int = 512

    def warn_missing(self) -> None:
        missing = [name for name in ("llm_api_key", "admin_dashboard_key",
                   "mesh_master_secret", "dockerhub_username", "dockerhub_token")
                   if not getattr(self, name)]
        if missing:
            logging.warning("Unconfigured settings: %s. Protected operations require configuration.",
                            ", ".join(missing))
