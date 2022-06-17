import argparse

from .helpers import ShefAlreadyExistsError, add_shef


def cmd_get_shef(args: argparse.Namespace):
    print("Get shef")
    print(args)


def cmd_add_shef(args: argparse.Namespace):
    try:
        add_shef(args.name, args.points)
        print(f"Added '{args.name}' to shefs")
    except ShefAlreadyExistsError:
        print("Shef already exists")
