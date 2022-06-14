from .base import Base
from sqlalchemy import Column, Integer, String


class Shef(Base):
    __tablename__ = "shef"

    id = Column(Integer, primary_key=True)
    name = Column(String(255))

    def __repr__(self) -> str:
        return f"Shef(id={self.id!r}, name={self.name!r})"
