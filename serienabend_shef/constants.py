from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent

DATA_DIR = Path.home() / ".local" / "share" / "serienabend_shef"
SQLITE_DB_FILE = DATA_DIR / "data.db"
DB_CONNECTION_URL = f"sqlite+pysqlite:///{str(SQLITE_DB_FILE)}"
