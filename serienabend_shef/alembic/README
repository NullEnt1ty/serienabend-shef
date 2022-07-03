Generic single-database configuration.

## Neue Migration hinzufügen

```shell
alembic -c <Pfad zu alembic.ini> revision --autogenerate -m <message>
```

Durch das Verwenden der Option `--autogenerate` vergleicht Alembic die SQLAlchemy-Modelle mit dem aktuellen
Datenbank-Zustand und versucht aus der Differenz ein Migrationsskript zu generieren. Die Option ist optional.

## Migrationen ausführen

```shell
alembic -c <Pfad zu alembic.ini> upgrade <revision>
```

Für `<revision>` kann beispielsweise "head" eingesetzt werden, um alle Migrationen bis zur neusten auszuführen.
