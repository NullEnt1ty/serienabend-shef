from .commands import parser

args = parser.parse_args()
args.func(args)
