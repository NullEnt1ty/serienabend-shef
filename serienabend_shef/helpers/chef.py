from typing import Optional
from sqlalchemy import exc, select

from .exceptions import ChefAlreadyExistsError
from ..db import Session, Chef


def get_chefs():
    with Session() as session:
        statement = select(Chef)
        chefs: list[Chef] = session.execute(statement).scalars().all()

        return chefs


def get_chef(name: str):
    with Session() as session:
        statement = select(Chef).where(Chef.name == name)
        chef: Optional[Chef] = session.execute(statement).scalar_one_or_none()

        return chef


def add_chef(name: str, starting_points: Optional[int]):
    with Session() as session:
        chef = Chef(name=name, points=starting_points)

        session.add(chef)

        try:
            session.commit()
        except exc.IntegrityError:
            raise ChefAlreadyExistsError(name)

    return chef
