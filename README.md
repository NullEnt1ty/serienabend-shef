# Serienabend Shef

_Hey, random internet person! If you stumbled accross this project asking yourself wth this is: This is a project I
created for me and my friends to find out who's gonna be the next chef on our weekly get together. The rest of this
documentation is in german but feel free to steal as much code as you'd like! The project is licensed under MIT._

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

### Verwendung

Bei der Anwendung handelt es sich um eine Kommandozeilenschnittstelle. Wird die Anwendung ohne weitere Parameter
gestartet, gibt sie ein Hilfe-Menü aus.

```shell
python -m serienabend_shef
```

Die Anwendung verwendet eine SQLite-Datenbank, die unter `<Heimverzeichnis>/.local/share/serienabend_shef` gespeichert
wird.

## Projektstruktur

- serienabend_shef
  - Quellcode für das Hauptmodul
- alembic
  - Datenbank-Migrationen
- docs
  - Dokumentation

## Projekt bauen

Das Projekt kann mit folgendem Befehl gebaut werden:

```shell
python -m build
```
