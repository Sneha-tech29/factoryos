"""Sliding-window rate limiter per page/route group conforming to Security.md."""

import time
from collections import defaultdict
from typing import Dict, List, Tuple
from app.core.errors import FactoryOSError

# Group definitions and maximum requests per 60-second window
GROUP_LIMITS: Dict[str, int] = {
    "AUTH_LOGIN": 20,
    "AUTH_SIGNUP": 10,
    "DASHBOARD_READ": 120,
    "RECORD_WRITE": 30,
    "WORKER_ACTION": 60,
    "CALCULATIONS": 15,
    "SCHEDULE_APPLY": 10,
    "IMPORT_PREVIEW": 10,
    "IMPORT_COMMIT": 5,
    "COPILOT": 20,
    "AGENT": 10,
    "REPORTS": 10
}

# In-memory sliding window history: key -> list of float timestamps
_window_store: Dict[str, List[float]] = defaultdict(list)


def check_rate_limit(group_name: str, identity_key: str):
    """
    Evaluates sliding-window request frequency for a specific group and identity.
    Returns None if permitted, raises FactoryOSError with 429 and Retry-After if exceeded.
    """
    limit = GROUP_LIMITS.get(group_name, 60)
    now = time.time()
    window_start = now - 60.0

    key = f"{group_name}:{identity_key}"
    timestamps = _window_store[key]

    # Prune timestamps older than 60 seconds
    valid_timestamps = [t for t in timestamps if t > window_start]
    _window_store[key] = valid_timestamps

    if len(valid_timestamps) >= limit:
        oldest_in_window = valid_timestamps[0]
        retry_after = int(max(1, 60.0 - (now - oldest_in_window)))
        raise FactoryOSError(
            code="RATE_LIMITED",
            message=f"Rate limit exceeded for {group_name}. Please wait {retry_after} seconds.",
            status_code=429,
            details={"group": group_name, "retry_after_seconds": retry_after}
        )

    # Record this request timestamp
    _window_store[key].append(now)
