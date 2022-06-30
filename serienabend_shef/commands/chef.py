import argparse

from ..helpers import (
    row2dict,
    rows2dicts,
    add_chef,
    get_chef,
    get_next_chef,
    get_chefs,
    delete_chef,
    add_point,
    ChefNotFoundError,
)


def cmd_get_chef(args: argparse.Namespace):
    chef = get_chef(args.name)

    if chef is None:
        raise ChefNotFoundError(args.name)

    chef_dict = row2dict(chef)

    return chef_dict


def cmd_get_next_chef(args: argparse.Namespace):
    chef = get_next_chef()

    if chef is None:
        raise Exception("You need to add at least one chef first")

    chef_dict = row2dict(chef)

    return chef_dict


def cmd_list_chefs(args: argparse.Namespace):
    chefs = get_chefs()
    chefs_dict = rows2dicts(chefs)

    return chefs_dict


def cmd_add_chef(args: argparse.Namespace):
    chef = add_chef(args.name, args.points, args.points_multiplier)
    chef_dict = row2dict(chef)

    return chef_dict


def cmd_delete_chef(args: argparse.Namespace):
    delete_chef(args.name)

    return f"Deleted chef '{args.name}'"


def cmd_add_point(args: argparse.Namespace):
    result = add_point(args.name)

    return result


def add_chef_parser(subparsers):
    chef_parser = subparsers.add_parser("chef")
    chef_parser.set_defaults(func=lambda args: chef_parser.print_help())
    chef_subparsers = chef_parser.add_subparsers()

    get_chef_parser = chef_subparsers.add_parser("get")
    get_chef_parser.set_defaults(func=cmd_get_chef)
    get_chef_parser.add_argument("name")

    get_next_chef_parser = chef_subparsers.add_parser("get-next")
    get_next_chef_parser.set_defaults(func=cmd_get_next_chef)

    list_chef_parser = chef_subparsers.add_parser("list")
    list_chef_parser.set_defaults(func=cmd_list_chefs)

    add_chef_parser = chef_subparsers.add_parser("add")
    add_chef_parser.set_defaults(func=cmd_add_chef)
    add_chef_parser.add_argument("name")
    add_chef_parser.add_argument("--points", type=int)
    add_chef_parser.add_argument("--points-multiplier", type=int)

    add_point_parser = chef_subparsers.add_parser("add-point")
    add_point_parser.set_defaults(func=cmd_add_point)
    add_point_parser.add_argument("name")

    delete_chef_parser = chef_subparsers.add_parser("delete")
    delete_chef_parser.set_defaults(func=cmd_delete_chef)
    delete_chef_parser.add_argument("name")
