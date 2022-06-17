from typing import Optional
from sqlalchemy import exc, select
from sqlalchemy.orm import Session

from .exceptions import ShefAlreadyExistsError
from ..db import engine, Shef


def get_shef(name: str):
    with Session(engine) as session:
        statement = select(Shef).where(Shef.name == name)
        shef: Optional[Shef] = session.scalar(statement)

        return shef


def add_shef(name: str, starting_points: Optional[int]):
    with Session(engine) as session:
        shef = Shef(name=name, points=starting_points)

        session.add(shef)

        try:
            session.commit()
        except exc.IntegrityError:
            raise ShefAlreadyExistsError(name)

    return shef
