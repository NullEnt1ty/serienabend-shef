import argparse

from .helpers import ShefAlreadyExistsError, add_shef, get_shef


def cmd_get_shef(args: argparse.Namespace):
    shef = get_shef(args.name)

    if shef is None:
        print("Shef not found")
        return

    print(shef)


def cmd_add_shef(args: argparse.Namespace):
    try:
        add_shef(args.name, args.points)
        print(f"Added '{args.name}' to shefs")
    except ShefAlreadyExistsError:
        print("Shef already exists")
