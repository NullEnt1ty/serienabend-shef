import sys

from .commands import parser
from .helpers import log_pretty, log_json


def main():
    args = parser.parse_args()
    error = None

    try:
        output = args.func(args)
    except Exception as err:
        error = err
        output = {"error": str(err)}

    if output is not None:
        if args.format == "pretty":
            log_pretty(output)
        elif args.format == "json":
            log_json(output)
        else:
            print(f"Unknown logging format configured: {args.format}")

    if error is not None:
        sys.exit(1)


if __name__ == "__main__":
    main()
