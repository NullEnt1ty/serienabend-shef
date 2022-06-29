import json


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
