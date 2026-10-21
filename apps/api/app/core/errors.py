"""Standardized error responses conforming to FactoryOS Rules."""

import uuid
from typing import Any, Dict, Optional
try:
    from fastapi import HTTPException, Request
    from fastapi.responses import JSONResponse
except ImportError:
    class HTTPException(Exception):
        def __init__(self, status_code: int, detail: str = ""):
            self.status_code = status_code
            self.detail = detail
    class JSONResponse:
        def __init__(self, status_code: int, content: Any):
            self.status_code = status_code
            self.content = content
    class Request:
        pass


class FactoryOSError(Exception):
    """Base application exception for FactoryOS."""
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: Optional[Dict[str, Any]] = None,
        correlation_id: Optional[str] = None
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        self.correlation_id = correlation_id or str(uuid.uuid4())
        super().__init__(self.message)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "error": {
                "code": self.code,
                "message": self.message,
                "details": self.details,
                "correlation_id": self.correlation_id,
            }
        }


async def factoryos_exception_handler(request: Request, exc: FactoryOSError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict()
    )


async def generic_http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    correlation_id = str(uuid.uuid4())
    code_map = {
        401: "AUTH_REQUIRED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        409: "CONFLICT",
        422: "VALIDATION_FAILED",
        429: "RATE_LIMITED",
        500: "INTERNAL_ERROR",
        503: "SERVICE_UNAVAILABLE"
    }
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": code_map.get(exc.status_code, "ERROR"),
                "message": str(exc.detail),
                "details": {},
                "correlation_id": correlation_id,
            }
        }
    )
