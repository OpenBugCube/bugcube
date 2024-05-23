"""
Author: Markus Stabrin
Contact: it@markus-stabrin.de
Github: mstabrin

API enpoints related to metadata.
"""

from fastapi import APIRouter

from .. import _tasks, backend
from ..backend import meta

module_router = APIRouter()

PUBLICATION_CACHE: dict[str, meta.Publication] = {}


@module_router.get("/publications", response_model=list[str])
async def publications():
    try:
        return list(PUBLICATION_CACHE)
    except KeyError:
        return []


@module_router.get("/datasets", response_model=list[str])
async def datasets(publication: str):
    try:
        return list(PUBLICATION_CACHE[publication].datasets)
    except KeyError:
        return []


@module_router.get("/directions", response_model=list[str])
async def directions(publication: str, dataset: str):
    try:
        return list(
            PUBLICATION_CACHE[publication].datasets[dataset].directions
        )
    except KeyError:
        return []


@module_router.get("/channels", response_model=list[str])
async def channels(publication: str, dataset: str, direction: str):
    try:
        return list(
            PUBLICATION_CACHE[publication]
            .datasets[dataset]
            .directions[direction]
            .channels
        )
    except KeyError:
        return []


@module_router.get("/metainfo", response_model=meta.YamlModel)
async def metainfo(publication: str, dataset: str):
    meta_object = backend.MetaObject(
        publication=publication, dataset=dataset, direction="", channel=""
    )
    try:
        return meta.get_meta_yaml(meta_object)
    except Exception as e:
        return meta.YamlModel(description=f"No metadata found. : {e}")


@module_router.on_event("startup")
@_tasks.repeat_every(seconds=15 * 60)
async def fill_cache():
    global PUBLICATION_CACHE
    PUBLICATION_CACHE = meta.get_meta_info()


def setup(router, name):
    router.include_router(module_router, prefix=f"/{name}", tags=[name])
