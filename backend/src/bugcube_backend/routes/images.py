"""
Author: Markus Stabrin
Contact: it@markus-stabrin.de
Github: mstabrin

Api endpoints for image related tasks.
"""
from fastapi import APIRouter

from .. import backend
from ..backend import images

module_router = APIRouter()


@module_router.get(
    "/overview", response_model=list[list[images.OverviewImage]]
)
async def overview(
    publication: str, dataset: str, direction: str, channel: str
):
    meta_object = backend.MetaObject(
        publication=publication,
        dataset=dataset,
        direction=direction,
        channel=channel,
    )

    try:
        return images.get_overview_images(meta_object)
    except Exception:
        return [[], [], [], []]


@module_router.get("/single", response_model=images.SingleImage)
async def single(path: str, idx: int):
    request_object = images.RequestImage(
        path=path,
        idx=idx,
    )

    try:
        return images.get_single_image(request_object)
    except Exception:
        return images.SingleImage(image="")


def setup(router, name):
    router.include_router(module_router, prefix=f"/{name}", tags=[name])
