import argparse
from .commands import cmd_add_shef, cmd_get_shef

parser = argparse.ArgumentParser()
subparsers = parser.add_subparsers()

parser.set_defaults(func=lambda args: parser.print_help())
parser.add_argument(
    "--format",
    default="pretty",
    choices=["pretty", "json"],
    help="specify the output format",
)

add_shef_parser = subparsers.add_parser("add-shef")
add_shef_parser.set_defaults(func=cmd_add_shef)
add_shef_parser.add_argument("name")
add_shef_parser.add_argument("--points", type=int)

get_shef_parser = subparsers.add_parser("get-shef")
get_shef_parser.set_defaults(func=cmd_get_shef)
get_shef_parser.add_argument("name")

args = parser.parse_args()
args.func(args)
