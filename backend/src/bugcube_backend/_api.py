import os

from fastapi import APIRouter, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from . import _config, routes

HERE = os.path.realpath(os.path.dirname(__file__))

templates = Jinja2Templates(directory=os.path.join(HERE, "templates"))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_config.SETTINGS.origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.mount(
    "/static", StaticFiles(directory=_config.SETTINGS.db_dir), name="static"
)


@app.get("/static", response_class=HTMLResponse)
def list_files_root(request: Request):
    return list_files(request)


@app.get("/static_dir/{path:path}", response_class=HTMLResponse)
def list_files(request: Request, path: str = "", *, db_dir=None, port=None):
    db_dir = db_dir or _config.SETTINGS.db_dir
    port = port or _config.SETTINGS.port

    dir_path = os.path.join(db_dir, path)
    files = os.listdir(dir_path)
    file_paths = []

    for file_name in sorted(files):
        base_url = request.url._url
        if str(port) not in base_url:
            split_url = base_url.split("/")
            base_url = (
                f"{'/'.join(split_url[:3])}:{port}/{'/'.join(split_url[3:])}"
            )
        new_file = os.path.join(dir_path, file_name)
        if os.path.isdir(new_file):
            if base_url.endswith("/static"):
                base_url = base_url.replace("/static", "/static_dir")
            else:
                base_url = base_url.replace("/static/", "/static_dir/")
        elif os.path.isfile(new_file):
            base_url = base_url.replace("/static_dir/", "/static/")

        file_paths.append(f"{base_url.strip('/')}/{file_name.strip('/')}")

    return templates.TemplateResponse(
        "list_files.html", {"request": request, "files": file_paths}
    )


router = APIRouter()


@router.get("/")
async def hello_world():
    return {"hello": "world"}


routes.setup(router)
app.include_router(router, prefix="/api")
