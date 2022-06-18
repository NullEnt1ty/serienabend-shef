from typing import Optional
from sqlalchemy import exc, select
from sqlalchemy.orm import Session

from .exceptions import ChefAlreadyExistsError
from ..db import engine, Chef


def get_chef(name: str):
    with Session(engine) as session:
        statement = select(Chef).where(Chef.name == name)
        chef: Optional[Chef] = session.scalar(statement)

        return chef


def add_chef(name: str, starting_points: Optional[int]):
    with Session(engine) as session:
        chef = Chef(name=name, points=starting_points)

        session.add(chef)

        try:
            session.commit()
        except exc.IntegrityError:
            raise ChefAlreadyExistsError(name)

    return chef
