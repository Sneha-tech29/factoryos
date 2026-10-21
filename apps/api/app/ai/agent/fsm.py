"""Persisted Agent Task State Machine conforming to PRD.md §3.12 and Rules.md §5."""

from typing import Dict, Any, List, Optional
from app.core.compat import BaseModel
from app.core.errors import FactoryOSError

VALID_AGENT_STATES = [
    "RECEIVED",
    "NEEDS_INFORMATION",
    "PLANNING",
    "ANALYSING",
    "WAITING_FOR_APPROVAL",
    "EXECUTING",
    "VERIFYING",
    "COMPLETED",
    "PARTIALLY_COMPLETED",
    "FAILED",
    "BLOCKED",
    "CANCELLED"
]

LEGAL_TRANSITIONS: Dict[str, List[str]] = {
    "RECEIVED": ["PLANNING", "NEEDS_INFORMATION", "CANCELLED"],
    "NEEDS_INFORMATION": ["PLANNING", "CANCELLED"],
    "PLANNING": ["ANALYSING", "FAILED", "CANCELLED"],
    "ANALYSING": ["WAITING_FOR_APPROVAL", "FAILED", "BLOCKED"],
    "WAITING_FOR_APPROVAL": ["EXECUTING", "CANCELLED", "BLOCKED"],
    "EXECUTING": ["VERIFYING", "FAILED"],
    "VERIFYING": ["COMPLETED", "PARTIALLY_COMPLETED", "FAILED"],
    "COMPLETED": [],
    "PARTIALLY_COMPLETED": [],
    "FAILED": [],
    "BLOCKED": ["PLANNING", "CANCELLED"],
    "CANCELLED": []
}


class AgentAction(BaseModel):
    id: str
    tool_name: str
    action_version: str
    preview_diff: Dict[str, Any]
    risk_level: str  # LOW | MEDIUM | HIGH
    approval_status: str  # PENDING | APPROVED | REJECTED


class AgentTask(BaseModel):
    id: str
    factory_id: str
    goal: str
    current_state: str
    proposed_actions: List[AgentAction]
    verified_results: List[Dict[str, Any]]
    correlation_id: str

    def transition_to(self, new_state: str):
        if new_state not in LEGAL_TRANSITIONS.get(self.current_state, []):
            raise FactoryOSError(
                code="INVALID_STATE_TRANSITION",
                message=f"Illegal agent transition from {self.current_state} to {new_state}.",
                status_code=409,
                correlation_id=self.correlation_id
            )
        self.current_state = new_state
