from .base import Base
from sqlalchemy import Column, Integer, String, text


class Shef(Base):
    __tablename__ = "shef"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, unique=True)
    points = Column(Integer, server_default=text("0"))

    def __repr__(self) -> str:
        return f"Shef(id={self.id!r}, name={self.name!r}, points={self.points!r})"
