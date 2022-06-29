import json

format = "pretty"


def set_logging_format(new_format: str):
    global format
    format = new_format


def log(value: any):
    if format == "pretty":
        log_pretty(value)
    elif format == "json":
        log_json(value)
    else:
        print(f"Unknown logging format configured: {format}")


def log_pretty(value: any):
    if isinstance(value, list):
        for val in value:
            log_pretty(val)
        return

    print(value)


def log_json(value: any):
    if isinstance(value, str):
        value = {"msg": value}

    try:
        value_serialized = json.dumps(value)
    except:
        fallback_value = {"msg": str(value)}
        value_serialized = json.dumps(fallback_value)

    print(value_serialized)
