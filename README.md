# Serienabend Shef

Legt fest, wer der nächste Koch am Serienabend ist.

![banner](docs/resources/banner.jpg)

## Dev-Setup

### Voraussetzungen

- Python >= 3.9
- pip (i.d.R. mit Python ausgeliefert)
- [Pipenv](https://github.com/pypa/pipenv)

### Installation

1. Abhängigkeiten installieren & Virtual Environment aktivieren:

    ```shell
    pipenv install --dev
    pipenv shell
    ```

1. Datenbank-Migrationen ausführen:

    ```shell
    alembic upgrade head
    ```

    Die Datenbank wird unter `<Heimverzeichnis>/.local/share/serienabend_shef` gespeichert.

### Verwendung

Bei der Anwendung handelt es sich um eine Kommandozeilenschnittstelle. Wird die Anwendung ohne weitere Parameter
gestartet, gibt sie ein Hilfe-Menü aus.

```shell
python -m serienabend_shef
```

## Projektstruktur

- serienabend_shef
  - Quellcode für das Hauptmodul
- alembic
  - Datenbank-Migrationen
- docs
  - Dokumentation
