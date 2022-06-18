import argparse

from .helpers import ChefAlreadyExistsError, add_chef, get_chef


def cmd_get_chef(args: argparse.Namespace):
    chef = get_chef(args.name)

    if chef is None:
        print("Chef not found")
        return

    print(chef)


def cmd_add_chef(args: argparse.Namespace):
    try:
        add_chef(args.name, args.points)
        print(f"Added '{args.name}' to chefs")
    except ChefAlreadyExistsError:
        print("Chef already exists")
