import argparse
from .commands import get_shef

parser = argparse.ArgumentParser()
subparsers = parser.add_subparsers()

parser.set_defaults(func=lambda args: parser.print_help())
parser.add_argument(
    "--format",
    default="pretty",
    choices=["pretty", "json"],
    help="specify the output format",
)

get_shef_parser = subparsers.add_parser("get-shef")
get_shef_parser.set_defaults(func=get_shef)

args = parser.parse_args()
args.func(args)
