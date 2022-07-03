from pathlib import Path

SERIENABEND_SHEF_PACKAGE_DIR = Path(__file__).parent

DATA_DIR = Path.home() / ".local" / "share" / "serienabend_shef"
SQLITE_DB_FILE = DATA_DIR / "data.db"
DB_CONNECTION_URL = f"sqlite+pysqlite:///{str(SQLITE_DB_FILE)}"
