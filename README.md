# Serienabend Shef

_Hey, random internet person! If you stumbled accross this project asking yourself wth this is: This is a project I
created for me and my friends to find out who's gonna be the next chef on our weekly get together. The rest of this
documentation is in german but feel free to steal as much code as you'd like! The project is licensed under MIT._

![banner](docs/resources/banner.jpg)

## Dev-Setup

### Voraussetzungen

- Bun >= 1.0.36
- MariaDB >= 10 (siehe `docker-compose.yaml`). MySQL sollte auch funktionieren, wurde aber nicht getestet.

### Installation

1. Abhängigkeiten installieren

   ```shell
   bun install
   ```

### Verwendung

Die Anwendung schreibt ihre Daten in eine MariaDB/MySQL-Datenbank. Für das Dev-Setup kann eine MariaDB-Instanz über
Docker gestartet werden:

```shell
docker compose up -d
```

Es wird außerdem eine Konfigurationsdatei benötigt. Es wird empfohlen, die Beispieldatei `chef_config.example.json` zu
kopieren und in `chef_config.json` umzubenennen. In der neuen Datei muss nun nur noch ein Token für den zu verwendenen
Telegram-Bot ergänzt werden.

Jetzt kann die Anwendung wie folgt gestartet werden:

```shell
CHEF_CONFIG=<PFAD_ZU_CONFIG_DATEI> bun run dev
```

### Datenbank-Verwaltung

Wenn das Dev-Setup (siehe [docker-compose.yaml](docker-compose.yaml)) verwendet wird, kann die Datenbank mit phpMyAdmin
über den Browser verwaltet werden. Die Webseite ist unter http://localhost:8080 zu erreichen. Benutzername und Passwort
lauten `root`.
