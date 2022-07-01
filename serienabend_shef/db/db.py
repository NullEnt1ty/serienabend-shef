from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .. import data_dir, db_connection_url

if not data_dir.exists():
    data_dir.mkdir(parents=True)

engine = create_engine(db_connection_url, echo=False, future=True)

Session = sessionmaker(engine, future=True)
