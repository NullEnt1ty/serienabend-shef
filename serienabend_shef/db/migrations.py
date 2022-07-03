from alembic import command, config

from ..constants import SERIENABEND_SHEF_PACKAGE_DIR

alembic_cfg = config.Config(SERIENABEND_SHEF_PACKAGE_DIR / "alembic.ini")
alembic_cfg.set_main_option("enable_logging", "False")


def run_migrations():
    command.upgrade(alembic_cfg, "head")
