import base64
import enum
import io
import pathlib
import re

import numpy as np
import pydantic
from PIL import Image

from .. import _config
from . import MetaObject

__all__ = [
    "get_overview_images",
    "SingleImage",
    "RequestImage",
    "get_single_image",
]


class ErrorEnum(enum.StrEnum):
    TOOMANYFILES = "TOOMANYFILES"
    BADNAMING = "BADNAMEING"


class RequestImage(pydantic.BaseModel):
    path: str
    idx: int


class SingleImage(RequestImage):
    image: str


class OverviewImage(SingleImage):
    zstack_file: str = ""
    tstack_zm_file: str = ""
    tstack_zn_file: str = ""
    download_name: str = ""


def __get_path(filename: pathlib.Path, db_dir: str):
    if not filename:
        return ""
    if not filename.is_file():
        return ""
    return str(filename).removeprefix(db_dir).strip("/")


def __adjust_image(image: Image):
    data = np.asarray(image, dtype=np.float32)
    new_data = 255 * (data - data.min()) / (data.max() - data.min())
    if new_data.ndim == 2:
        output_type = "L"
    elif new_data.ndim == 3:
        output_type = "RGB"
    else:
        output_type = "RGB"
    return Image.fromarray(np.uint8(new_data)).convert(output_type)


def __get_data_url(image: Image):
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    base_image = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{base_image}"


def get_single_image(
    image_request: RequestImage, db_dir: str = None
) -> SingleImage:
    db_dir = db_dir or _config.SETTINGS.db_dir

    image_file = pathlib.Path(
        db_dir,
        image_request.path,
    )

    with Image.open(image_file) as im:
        im.seek(image_request.idx)
        frame = __adjust_image(im)
        return SingleImage(
            path=image_request.path,
            idx=image_request.idx,
            image=__get_data_url(frame),
        )


def get_overview_images(
    metadata: MetaObject,
    db_dir: str = None,
    thumbnail_size_x: int = None,
    thumbnail_size_y: int = None,
) -> list[list[OverviewImage]]:
    db_dir = db_dir or _config.SETTINGS.db_dir
    thumbnail_size_x = thumbnail_size_x or _config.SETTINGS.thumbnail_size_x
    thumbnail_size_y = thumbnail_size_y or _config.SETTINGS.thumbnail_size_y

    channel_path = pathlib.Path(
        db_dir,
        metadata.publication,
        metadata.dataset,
        metadata.direction,
        metadata.channel,
    )

    overview_images = [[], [], [], []]
    cur_idx = -1
    for file_path in sorted(channel_path.iterdir()):
        if not file_path.is_dir():
            continue
        cur_idx += 1
        cur_overview = overview_images[cur_idx]

        publication = metadata.publication.split("-", 1)[1]
        dataset = metadata.dataset
        direction = file_path.name
        channel = metadata.channel

        file_name_template = f"{publication}-{dataset}TP{{prefix}}{direction}{channel}PL({{suffix}}).[Tt][Ii][Ff]*"

        tstacks_zn_file_glob = file_name_template.format(
            prefix="(TS)", suffix="Z*"
        )

        zn_image_files = list(file_path.glob(tstacks_zn_file_glob))
        if not zn_image_files:
            continue
        elif len(zn_image_files) > 1:
            cur_overview.append(
                OverviewImage(path=ErrorEnum.TOOMANYFILES, idx=0, image="")
            )
            continue
        tstacks_zn_file = zn_image_files[0]

        search_group = re.match("([(].4[)])-(.*)-YN-ZN", metadata.direction)
        if not search_group:
            cur_overview.append(
                OverviewImage(path=ErrorEnum.BADNAMING, idx=0, image="")
            )
            continue

        prefix, name = search_group.groups()

        zm_path = pathlib.Path(
            db_dir,
            metadata.publication,
            metadata.dataset,
            metadata.direction.replace(
                f"{prefix}-{name}-YN-ZN",
                f"{prefix.replace('4', '2')}-{name}-YM-ZM",
            ),
            metadata.channel,
            file_path.name,
        )
        tstacks_zm_file_glob = file_name_template.format(
            prefix="(TS)", suffix="ZM"
        )

        zm_image_files = list(zm_path.glob(tstacks_zm_file_glob))
        if not zm_image_files:
            tstacks_zm_file = ""
        elif len(zm_image_files) > 1:
            tstacks_zm_file = ""
        else:
            tstacks_zm_file = zm_image_files[0]

        zs_path = pathlib.Path(
            db_dir,
            metadata.publication,
            metadata.dataset,
            metadata.direction.replace(
                f"{prefix}-{name}-YN-ZN",
                f"{prefix.replace('4', '1')}-{name.replace('T', 'Z')}-ZS",
            ),
            metadata.channel,
            file_path.name,
        )

        with Image.open(tstacks_zn_file) as im:
            for frame_idx in range(im.n_frames):
                cur_frame = f"{frame_idx+1:04d}"
                zs_image_files = list(
                    zs_path.glob(
                        file_name_template.format(
                            prefix=cur_frame, suffix="ZS"
                        )
                    )
                )
                if not zs_image_files:
                    zstacks_file = ""
                elif len(zs_image_files) > 1:
                    zstacks_file = ""
                else:
                    zstacks_file = zs_image_files[0]

                im.seek(frame_idx)
                frame = __adjust_image(im)
                frame.thumbnail((thumbnail_size_x, thumbnail_size_y))
                cur_overview.append(
                    OverviewImage(
                        path=__get_path(tstacks_zn_file, db_dir=db_dir),
                        idx=frame_idx,
                        image=__get_data_url(frame),
                        zstack_file=__get_path(zstacks_file, db_dir=db_dir),
                        tstack_zm_file=__get_path(
                            tstacks_zm_file, db_dir=db_dir
                        ),
                        tstack_zn_file=__get_path(
                            tstacks_zn_file, db_dir=db_dir
                        ),
                        download_name=tstacks_zn_file.name.replace(
                            "(TS)", cur_frame
                        ),
                    )
                )
    return overview_images
