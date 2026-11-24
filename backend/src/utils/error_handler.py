"""Error handling decorator for Lambda handlers."""

import os
import traceback
from typing import Callable

from utils.responses import error_response


def handle_errors(include_traceback: bool = False):
    """Decorator to catch exceptions and return standardized error responses."""

    def decorator(func):
        def wrapper(event, context):
            try:
                return func(event, context)
            except Exception as e:
                print(f"ERROR: {e.__class__.__name__}: {e}")
                if include_traceback:
                    print(traceback.format_exc())
                return error_response(str(e), 500)

        return wrapper

    return decorator


def lambda_handler_with_errors(operation_name: str):
    """Decorator factory for Lambda handlers with error handling."""

    def decorator(handler_func: Callable):
        @handle_errors(
            include_traceback=os.environ.get("ENVIRONMENT", "prod") == "dev"
        )
        def wrapper(event, context):
            return handler_func(event, context)

        return wrapper

    return decorator
