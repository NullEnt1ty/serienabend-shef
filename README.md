# Serienabend Shef

_Hey, random internet person! If you stumbled accross this project asking yourself wth this is: This is a project I
created for me and my friends to find out who's gonna be the next chef on our weekly get together. The rest of this
documentation is in german but feel free to steal as much code as you'd like! The project is licensed under MIT._

![banner](docs/resources/banner.jpg)

## Dev-Setup

### Voraussetzungen

- Node.js >= 18
- npm >= 7 (i.d.R. mit Node.js ausgeliefert)
- MariaDB >= 10 (siehe `docker-compose.yaml`). MySQL sollte auch funktionieren, wurde aber nicht getestet.

### Installation

1. Abhängigkeiten installieren

   ```shell
   npm install
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
CHEF_CONFIG=<PFAD_ZU_CONFIG_DATEI> npm run dev
```

## Projekt bauen

Das Projekt kann mit folgendem Befehl gebaut werden:

```shell
npm run build
```

Das Kompilat befindet sich im Ordner `<Projektverzeichnis>/dist`.
