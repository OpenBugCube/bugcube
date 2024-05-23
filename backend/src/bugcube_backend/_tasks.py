"""
Most Code taken from the fastapi-utils project:
    https://github.com/dmontagu/fastapi-utils/blob/master/fastapi_utils/tasks.py

Co-Author: Markus Stabrin
Contact: it@markus-stabrin.de
Github: mstabrin

This script provides a utility function to easily repeat processes in a
separate thread.
"""
# flake8: noqa
from __future__ import annotations

import asyncio
import datetime
import logging
from asyncio import ensure_future
from functools import wraps
from traceback import format_exception
from typing import Any, Callable, Coroutine, Union

from starlette.concurrency import run_in_threadpool

NoArgsNoReturnFuncT = Callable[[], None]
NoArgsNoReturnAsyncFuncT = Callable[[], Coroutine[Any, Any, None]]
NoArgsNoReturnDecorator = Callable[
    [Union[NoArgsNoReturnFuncT, NoArgsNoReturnAsyncFuncT]],
    NoArgsNoReturnAsyncFuncT,
]


def repeat_every(
    *,
    seconds: float,
    wait_first: bool = False,
    logger: logging.Logger | None = None,
    raise_exceptions: bool = False,
    max_repetitions: int | None = None,
    start_time: datetime.datetime = None,
    ignore_after_day_time: datetime.datetime = None,
    ignore_weekends: bool = False,
) -> NoArgsNoReturnDecorator:
    """
    This function returns a decorator that modifies a function so it is periodically re-executed after its first call.

    The function it decorates should accept no arguments and return nothing. If necessary, this can be accomplished
    by using `functools.partial` or otherwise wrapping the target function prior to decoration.

    Parameters
    ----------
    seconds: float
        The number of seconds to wait between repeated calls
    wait_first: bool (default False)
        If True, the function will wait for a single period before the first call
    logger: Optional[logging.Logger] (default None)
        The logger to use to log any exceptions raised by calls to the decorated function.
        If not provided, exceptions will not be logged by this function (though they may be handled by the event loop).
    raise_exceptions: bool (default False)
        If True, errors raised by the decorated function will be raised to the event loop's exception handler.
        Note that if an error is raised, the repeated execution will stop.
        Otherwise, exceptions are just logged and the execution continues to repeat.
        See https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.set_exception_handler for more info.
    max_repetitions: Optional[int] (default None)
        The maximum number of times to call the repeated function. If `None`, the function is repeated forever.
    """

    def decorator(
        func: NoArgsNoReturnAsyncFuncT | NoArgsNoReturnFuncT,
    ) -> NoArgsNoReturnAsyncFuncT:
        """
        Converts the decorated function into a repeated, periodically-called version of itself.
        """
        is_coroutine = asyncio.iscoroutinefunction(func)

        @wraps(func)
        async def wrapped() -> None:
            repetitions = 0

            async def loop() -> None:
                nonlocal repetitions
                if wait_first:
                    await asyncio.sleep(seconds)
                while max_repetitions is None or repetitions < max_repetitions:
                    if (
                        ignore_weekends
                        and datetime.datetime.now().weekday() in (5, 6)
                    ):
                        # Do nothing on weekends
                        await asyncio.sleep(1800)
                        continue

                    if start_time is not None:
                        now = datetime.datetime.now()
                        today_start_time = datetime.datetime(
                            now.year,
                            now.month,
                            now.day,
                            start_time.hour,
                            start_time.minute,
                            start_time.second,
                            start_time.microsecond,
                        )
                        if now < today_start_time:
                            # Check every minute if condition is true
                            await asyncio.sleep(60)
                            continue

                    if ignore_after_day_time is not None:
                        now = datetime.datetime.now()
                        today_ignore_time = datetime.datetime(
                            now.year,
                            now.month,
                            now.day,
                            ignore_after_day_time.hour,
                            ignore_after_day_time.minute,
                            ignore_after_day_time.second,
                            ignore_after_day_time.microsecond,
                        )
                        if now > today_ignore_time:
                            # Check every minute if condition is true
                            await asyncio.sleep(60)
                            continue

                    try:
                        if is_coroutine:
                            await func()  # type: ignore
                        else:
                            await run_in_threadpool(func)
                        repetitions += 1
                    except Exception as exc:
                        if logger is not None:
                            formatted_exception = "".join(
                                format_exception(
                                    type(exc), exc, exc.__traceback__
                                )
                            )
                            logger.error(formatted_exception)
                        if raise_exceptions:
                            raise exc
                    await asyncio.sleep(seconds)

            ensure_future(loop())

        return wrapped

    return decorator
