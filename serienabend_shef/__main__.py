import argparse
from .commands import cmd_add_chef, cmd_get_chef

parser = argparse.ArgumentParser()
subparsers = parser.add_subparsers()

parser.set_defaults(func=lambda args: parser.print_help())
parser.add_argument(
    "--format",
    default="pretty",
    choices=["pretty", "json"],
    help="specify the output format",
)

add_chef_parser = subparsers.add_parser("add-chef")
add_chef_parser.set_defaults(func=cmd_add_chef)
add_chef_parser.add_argument("name")
add_chef_parser.add_argument("--points", type=int)

get_chef_parser = subparsers.add_parser("get-chef")
get_chef_parser.set_defaults(func=cmd_get_chef)
get_chef_parser.add_argument("name")

args = parser.parse_args()
args.func(args)
