"""
Author: Markus Stabrin
Contact: it@markus-stabrin.de
Github: mstabrin

API endpoints for miscellaneous tasks.
"""

import pathlib

from fastapi import APIRouter, HTTPException, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse

from .. import _config
from ..backend import misc

module_router = APIRouter()


def _create_exception_message(name, exception):
    e_type = type(exception).__name__
    return f"Error reading {name}!\n\n{e_type}:\n{exception}"


def setup(router, name):
    router.include_router(module_router, prefix=f"/{name}", tags=[name])


@module_router.get("/get_endpoints", response_model=list[str])
async def get_endpoints():
    return misc.get_misc_options()


@module_router.get("/endpoint/{endpoint:path}", response_model=str)
async def metainfo(endpoint: str, extension: str = ".txt"):
    try:
        return misc.get_misc_info(endpoint, extension)
    except Exception as e:
        return _create_exception_message(endpoint, e)


@module_router.get("/download_file")
async def download(filename: str, *, db_dir: str = None):
    db_dir = db_dir or _config.SETTINGS.db_dir
    file_name = pathlib.Path(
        db_dir,
        filename,
    )
    try:
        return FileResponse(file_name)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=jsonable_encoder({"detail": str(e)}),
        )
