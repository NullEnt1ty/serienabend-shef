from typing import Optional
from sqlalchemy import exc
from sqlalchemy.orm import Session

from .exceptions import ShefAlreadyExistsError
from ..db import engine, Shef


def add_shef(name: str, starting_points: Optional[int]):
    with Session(engine) as session:
        shef = Shef(name=name, points=starting_points)

        session.add(shef)

        try:
            session.commit()
        except exc.IntegrityError:
            raise ShefAlreadyExistsError(name)

    return shef
