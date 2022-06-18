import argparse

from ..helpers import ChefAlreadyExistsError, add_chef, get_chef


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


def add_chef_parser(subparsers):
    chef_parser = subparsers.add_parser("chef")
    chef_parser.set_defaults(func=lambda args: chef_parser.print_help())
    chef_subparsers = chef_parser.add_subparsers()

    add_chef_parser = chef_subparsers.add_parser("add")
    add_chef_parser.set_defaults(func=cmd_add_chef)
    add_chef_parser.add_argument("name")
    add_chef_parser.add_argument("--points", type=int)

    get_chef_parser = chef_subparsers.add_parser("get")
    get_chef_parser.set_defaults(func=cmd_get_chef)
    get_chef_parser.add_argument("name")
