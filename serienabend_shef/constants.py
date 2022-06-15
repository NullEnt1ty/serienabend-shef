from pathlib import Path

data_dir = Path.home() / ".local" / "share" / "serienabend_shef"
sqlite_db_file = data_dir / "data.db"
db_connection_url = f"sqlite+pysqlite:///{str(sqlite_db_file)}"
