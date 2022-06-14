from pathlib import Path
from sqlalchemy import create_engine

data_dir = Path.home() / ".local" / "share" / "serienabend_shef"
sqlite_db_file = data_dir / "data.db"

if not data_dir.exists():
    data_dir.mkdir(parents=True)

engine = create_engine(
    f"sqlite+pysqlite:///{str(sqlite_db_file)}", echo=True, future=True
)
