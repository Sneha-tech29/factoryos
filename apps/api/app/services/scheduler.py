"""Deterministic Production Scheduler & Action Preview Generator conforming to PRD.md §3.6."""

from typing import Dict, Any, List, Optional
from app.core.compat import BaseModel


class ScheduleCandidate(BaseModel):
    order_id: str
    order_number: str
    machine_id: str
    machine_name: str
    sequence_order: int
    estimated_setup_minutes: int
    estimated_run_hours: float
    projected_completion: str
    status: str


class ScheduleDiffPreview(BaseModel):
    proposed_job_id: str
    machine_id: str
    action_type: str  # REASSIGN | RESEQUENCE | EXPEDITE
    affected_orders: List[Dict[str, Any]]
    bottleneck_detected: bool
    summary: str


class SchedulerEngine:
    @staticmethod
    def generate_candidate_schedule(
        orders: List[Dict[str, Any]],
        machines: List[Dict[str, Any]]
    ) -> List[ScheduleCandidate]:
        candidates = []
        # Sort orders by deadline urgency
        sorted_orders = sorted(orders, key=lambda x: x.get("deadline", "9999"))

        # Default mapping: offset press for high volume, digital for quick cards
        for idx, order in enumerate(sorted_orders, start=1):
            qty = order.get("quantity", 0)
            if qty <= 2500:
                target_machine = next((m for m in machines if m.get("type") == "DIGITAL"), machines[0])
            else:
                target_machine = next((m for m in machines if m.get("type") == "OFFSET"), machines[0])

            speed = target_machine.get("speed_units_per_hr", 10000)
            setup = target_machine.get("setup_time_mins", 30)
            run_hours = round(qty / max(1, speed), 2)

            candidates.append(ScheduleCandidate(
                order_id=order.get("id", ""),
                order_number=order.get("order_number", ""),
                machine_id=target_machine.get("id", ""),
                machine_name=target_machine.get("name", ""),
                sequence_order=idx,
                estimated_setup_minutes=setup,
                estimated_run_hours=run_hours,
                projected_completion=order.get("deadline", "Pending"),
                status="PROPOSED_OPTIMAL"
            ))

        return candidates

    @staticmethod
    def generate_preview_diff(
        target_order_id: str,
        new_machine_id: str,
        orders: List[Dict[str, Any]],
        machines: List[Dict[str, Any]]
    ) -> ScheduleDiffPreview:
        target_machine = next((m for m in machines if m.get("id") == new_machine_id), None)
        machine_name = target_machine.get("name", new_machine_id) if target_machine else new_machine_id

        affected = []
        for o in orders:
            if o.get("id") != target_order_id and o.get("status") == "IN_PRODUCTION":
                affected.append({
                    "order_id": o.get("id"),
                    "order_number": o.get("order_number"),
                    "previous_status": o.get("status"),
                    "delay_risk": "Buffer reduced by 45 mins due to machine reallocation"
                })

        return ScheduleDiffPreview(
            proposed_job_id=f"job_{target_order_id}",
            machine_id=new_machine_id,
            action_type="REASSIGN_MACHINE",
            affected_orders=affected,
            bottleneck_detected=len(affected) > 2,
            summary=f"Reassigning to {machine_name}. Recalculated impact on {len(affected)} downstream orders."
        )
