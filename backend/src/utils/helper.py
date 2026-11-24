import re
from typing import Any


def to_camel_case(snake_str: str) -> str:
    """
    Convert snake_case or kebab-case to camelCase.
    """
    camel_str = re.sub(r"[-_]+", " ", snake_str).title().replace(" ", "")
    return camel_str[0].lower() + camel_str[1:] if camel_str else camel_str


def dict_keys_to_camel_case(obj: Any):
    """
    Recursively convert all dict keys to camelCase.
    Handles:
    - dict
    - list
    - primitives
    """
    if isinstance(obj, dict):
        new_dict = {}
        for key, value in obj.items():
            new_key = to_camel_case(key)
            new_dict[new_key] = dict_keys_to_camel_case(value)
        return new_dict

    elif isinstance(obj, list):
        return [dict_keys_to_camel_case(item) for item in obj]

    else:
        return obj