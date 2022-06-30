from typing import Optional
from sqlalchemy import exc, select, delete

from .exceptions import ChefAlreadyExistsError, ChefNotFoundError
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


def get_next_chef():
    with Session() as session:
        statement = select(Chef).order_by(Chef.points.asc()).limit(1)
        chef: Optional[Chef] = session.execute(statement).scalar_one_or_none()

        return chef


def add_chef(
    name: str, starting_points: Optional[int], points_multiplier: Optional[int]
):
    with Session() as session:
        chef = Chef(
            name=name, points=starting_points, points_multiplier=points_multiplier
        )

        session.add(chef)

        try:
            session.commit()
        except exc.IntegrityError:
            raise ChefAlreadyExistsError(name)

        # Load attributes of this chef instance eagerly in order to access them
        # later after this session was closed (which happens once we leave this
        # with-block).
        session.refresh(chef)

    return chef


def delete_chef(name: str):
    with Session() as session:
        statement = delete(Chef).where(Chef.name == name)
        result = session.execute(statement)
        session.commit()

        if result.rowcount == 0:
            raise ChefNotFoundError(name)


def add_point(name: str):
    with Session() as session:
        statement = select(Chef).where(Chef.name == name)
        chef: Chef = session.execute(statement).scalar_one()

        points_before = chef.points
        points_to_add = 1 * chef.points_multiplier
        chef.points = chef.points + points_to_add

        session.commit()

        return {
            "added_points": points_to_add,
            "points_before": points_before,
            "points_after": chef.points,
            "points_multiplier": chef.points_multiplier,
        }
