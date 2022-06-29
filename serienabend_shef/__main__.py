from .commands import parser
from .helpers import set_logging_format

args = parser.parse_args()
set_logging_format(args.format)
args.func(args)
