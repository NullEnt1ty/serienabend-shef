def row2dict(row):
    if row is None:
        return None

    d = {}

    for column in row.__table__.columns:
        d[column.name] = str(getattr(row, column.name))

    return d


def rows2dicts(rows: list):
    return list(map(row2dict, rows))
