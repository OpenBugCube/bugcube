import pydantic

__all__ = ["MetaObject"]


class DownloadObject(pydantic.BaseModel):
    path: str
    target: str
    idx: int


class MetaObject(pydantic.BaseModel):
    publication: str
    dataset: str
    direction: str
    channel: str
