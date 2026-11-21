import logging
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    redis_url: str = ""
    mesh_master_secret: str = ""
    admin_dashboard_key: str = ""
    llm_api_key: str = ""
    llm_base_url: str = "https://openrouter.ai/api/v1"
    planner_model: str = "google/gemini-2.5-flash"
    containerizer_model: str = "qwen/qwen3-coder"
    recovery_model: str = "google/gemini-2.5-flash"
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
