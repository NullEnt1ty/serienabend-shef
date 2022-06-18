import argparse

from .chef import add_chef_parser

parser = argparse.ArgumentParser()
parser.set_defaults(func=lambda args: parser.print_help())
parser.add_argument(
    "--format",
    default="pretty",
    choices=["pretty", "json"],
    help="specify the output format",
)

subparsers = parser.add_subparsers()

add_chef_parser(subparsers)
