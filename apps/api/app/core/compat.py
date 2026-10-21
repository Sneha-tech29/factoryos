"""Compatibility layer for Pydantic and standard library dataclasses."""

try:
    from pydantic import BaseModel
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)

        def model_dump(self):
            res = {}
            for k, v in self.__dict__.items():
                if not k.startswith("_"):
                    if hasattr(v, "model_dump"):
                        res[k] = v.model_dump()
                    elif isinstance(v, list):
                        res[k] = [item.model_dump() if hasattr(item, "model_dump") else item for item in v]
                    else:
                        res[k] = v
            return res

        def dict(self):
            return self.model_dump()
