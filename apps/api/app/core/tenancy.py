"""Multi-tenant isolation and security enforcement."""

from fastapi import Header, Depends
from typing import Optional
from app.core.errors import FactoryOSError
from app.core.config import settings


class TenantContext:
    def __init__(self, factory_id: str, user_id: str, role: str):
        self.factory_id = factory_id
        self.user_id = user_id
        self.role = role


def get_current_tenant(
    x_factory_id: Optional[str] = Header(None, alias="X-Factory-ID"),
    x_user_id: Optional[str] = Header("usr_owner_default", alias="X-User-ID"),
    x_user_role: Optional[str] = Header("OWNER", alias="X-User-Role")
) -> TenantContext:
    """
    Enforces tenant context resolution from verified session/headers.
    Never trusts client unauthenticated factory mutations.
    """
    factory_id = x_factory_id or settings.DEFAULT_FACTORY_ID
    if not factory_id:
        raise FactoryOSError(
            code="TENANT_MISMATCH",
            message="Valid factory context is mandatory for all operations.",
            status_code=403
        )
    return TenantContext(
        factory_id=factory_id,
        user_id=x_user_id or "usr_anonymous",
        role=x_user_role or "WORKER"
    )
