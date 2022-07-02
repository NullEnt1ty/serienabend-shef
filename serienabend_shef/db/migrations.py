import logging
from alembic import command, config

from ..constants import PROJECT_ROOT

alembic_cfg = config.Config(PROJECT_ROOT / "alembic.ini")
alembic_cfg.set_main_option("enable_logging", "False")


def run_migrations():
    command.upgrade(alembic_cfg, "head")
