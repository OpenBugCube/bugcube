import os
import pathlib

import pydantic
import pydantic_yaml

from .. import _config
from . import MetaObject

__all__ = ["get_meta_info", "Publication", "get_meta_yaml"]


class YamlModel(pydantic.BaseModel):
    description: str = ""
    youtube_link: str = ""
    pubmed_link: str = ""
    database_link: str = ""
    excel_file: str = ""


class Channel(pydantic.BaseModel):
    name: str


class Direction(pydantic.BaseModel):
    name: str
    channels: dict[str, Channel]


class Dataset(pydantic.BaseModel):
    name: str
    directions: dict[str, Direction]


class Publication(pydantic.BaseModel):
    name: str
    datasets: dict[str, Dataset]


def __get_dirs(path: str):
    return sorted(
        _
        for _ in os.listdir(path)
        if os.path.isdir(os.path.join(path, _)) and not _.startswith("_")
    )


def __get_channels(path: str) -> dict[str, Channel]:
    return {key: Channel(name=key) for key in __get_dirs(path)}


def __get_directions(path: str) -> dict[str, Direction]:
    return {
        key: Direction(
            name=key, channels=__get_channels(os.path.join(path, key))
        )
        for key in __get_dirs(path)
        if "4)-" in key
    }


def __get_datasets(path: str) -> dict[str, Dataset]:
    return {
        key: Dataset(
            name=key, directions=__get_directions(os.path.join(path, key))
        )
        for key in __get_dirs(path)
    }


def get_meta_info(db_dir: str = None) -> dict[str, Publication]:
    db_dir = db_dir or _config.SETTINGS.db_dir

    return {
        key: Publication(
            name=key, datasets=__get_datasets(os.path.join(db_dir, key))
        )
        for key in __get_dirs(db_dir)
    }


def get_meta_yaml(metadata: MetaObject, db_dir: str = None) -> YamlModel:
    db_dir = db_dir or _config.SETTINGS.db_dir

    yaml_file = pathlib.Path(
        db_dir,
        metadata.publication,
        metadata.dataset,
        "(B0)-Metadata",
        f"{metadata.publication}-{metadata.dataset}-BugCubeInfo.yaml",
    )
    try:
        return_yaml = pydantic_yaml.parse_yaml_raw_as(
            YamlModel, yaml_file.read_text()
        )
    except Exception:
        return_yaml = YamlModel()

    if not return_yaml.description:
        description_file = pathlib.Path(
            db_dir,
            metadata.publication,
            metadata.dataset,
            "(B0)-Metadata",
            f"{metadata.publication}-{metadata.dataset}-BugCubeInfo.txt",
        )
        if description_file.is_file():
            try:
                return_yaml.description = description_file.read_text()
            except Exception as e:
                return_yaml.description = (
                    f"No description available.\n\nError:\n{e}"
                )
        else:
            return_yaml.description = "No description available."

    if not return_yaml.database_link:
        return_yaml.database_link = pathlib.Path(
            metadata.publication,
            metadata.dataset,
        )

    if not return_yaml.excel_file:
        excel_file = pathlib.Path(
            metadata.publication,
            metadata.dataset,
            "(B0)-Metadata",
            f"{metadata.publication}-{metadata.dataset}-Metadata.xlsx",
        )
        if (db_dir / excel_file).is_file():
            return_yaml.excel_file = excel_file

    return return_yaml
