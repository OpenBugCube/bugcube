from glob import iglob
from importlib import import_module
from os.path import basename, dirname, join, realpath, splitext

HERE = realpath(dirname(__file__))


def setup(router):
    for file in iglob(join(HERE, "*.py")):
        if basename(file).startswith("_"):
            continue
        module_name: str = basename(splitext(file)[0])
        mod = import_module(f"{__name__}.{module_name}")
        mod.setup(router, module_name)
