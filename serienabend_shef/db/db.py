from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .. import DATA_DIR, DB_CONNECTION_URL

if not DATA_DIR.exists():
    DATA_DIR.mkdir(parents=True)

engine = create_engine(DB_CONNECTION_URL, echo=False, future=True)

Session = sessionmaker(engine, future=True)
