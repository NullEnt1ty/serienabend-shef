from pathlib import Path
from sqlalchemy import create_engine
from .. import data_dir, db_connection_url

if not data_dir.exists():
    data_dir.mkdir(parents=True)

engine = create_engine(db_connection_url, echo=True, future=True)
