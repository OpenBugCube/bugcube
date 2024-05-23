"""
Author: Markus Stabrin
Contact: it@markus-stabrin.de
Github: mstabrin

This script is an endpoint for debugging purposes.
"""

import argparse
import logging

from . import _config


def shared_parser() -> argparse.ArgumentParser:
    """
    Create and return the ArgumenParser

    returns:
    argparse.ArgumentParser
    """
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("-v", "--info", dest="info", action="store_true")
    parser.add_argument("-vv", "--debug", dest="debug", action="store_true")
    return parser


def run():
    import uvicorn

    parser = argparse.ArgumentParser(parents=[shared_parser()])
    parser.add_argument("--port", default=None, type=int)

    args = parser.parse_args()
    if args.debug:
        logging.basicConfig(level=logging.DEBUG)
    elif args.info:
        logging.basicConfig(level=logging.INFO)

    if args.port is not None:
        settings = _config.Settings(port=args.port)
    else:
        settings = _config.Settings()

    uvicorn.run(
        "bugcube_backend._api:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True,
    )
