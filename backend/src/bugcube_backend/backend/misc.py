"""
Author: Markus Stabrin
Contact: it@markus-stabrin.de
Github: mstabrin

Utility functions that helps to handle metadata and images.
"""

import os
import pathlib

from .. import _config


def _read_from_file(file_path: pathlib.Path):
    if not file_path.is_file():
        raise FileNotFoundError(f"File '{file_path}' not found!")
    return file_path.read_text()


def get_misc_options(*, db_dir=None) -> list[str]:
    db_dir = pathlib.Path(db_dir or _config.SETTINGS.db_dir)
    info_dir = db_dir / "_bugcube_misc"
    return sorted(
        [tuple(os.path.splitext(_.name)) for _ in info_dir.glob("*")]
    )


def get_misc_info(file_basename, extension: str, *, db_dir=None) -> str:
    db_dir = pathlib.Path(db_dir or _config.SETTINGS.db_dir)
    info_file = db_dir / "_bugcube_misc" / f"{file_basename}{extension}"

    return _read_from_file(info_file)
