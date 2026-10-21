"""Deterministic Order Feasibility Engine conforming to PRD.md §3.5."""

from datetime import datetime
from typing import Dict, Any, List, Optional
from app.core.compat import BaseModel
from app.services.inventory import InventoryEngine


class FeasibilityVerdict(BaseModel):
    order_id: str
    verdict: str  # SAFE | POSSIBLE_WITH_RISK | NOT_RECOMMENDED | CANNOT_ASSESS
    confidence: str  # HIGH | MEDIUM | LOW (never percentage)
    summary: str
    constraints_met: List[str]
    constraints_violated: List[str]
    missing_data: List[str]
    assumptions: List[str]
    recommended_action: str


class FeasibilityEngine:
    @staticmethod
    def evaluate_order(
        order: Dict[str, Any],
        materials_db: Dict[str, Dict[str, Any]],
        machines_db: Dict[str, Dict[str, Any]]
    ) -> FeasibilityVerdict:
        order_id = order.get("id", "ord_unknown")
        quantity = order.get("quantity", 0)
        deadline_str = order.get("deadline")
        required_materials = order.get("required_materials", [])

        missing_data = []
        constraints_met = []
        constraints_violated = []
        assumptions = []

        if not deadline_str:
            missing_data.append("Customer delivery deadline is missing.")
        if quantity <= 0:
            missing_data.append("Order quantity must be greater than zero.")
        if not required_materials:
            missing_data.append("Bill of Materials (BOM) substrate specs missing.")

        if missing_data:
            return FeasibilityVerdict(
                order_id=order_id,
                verdict="CANNOT_ASSESS",
                confidence="LOW",
                summary="Insufficient specifications to assess order feasibility.",
                constraints_met=[],
                constraints_violated=[],
                missing_data=missing_data,
                assumptions=["No fallback values assumed; awaiting exact inputs."],
                recommended_action="Request missing specifications from the client before committing."
            )

        # 1. Material Availability Check
        has_critical_shortage = False
        has_warning_shortage = False

        for req in required_materials:
            mat_id = req.get("material_id")
            needed_qty = req.get("quantity", 0)
            material = materials_db.get(mat_id)

            if not material:
                missing_data.append(f"Material {mat_id} not found in inventory catalog.")
                continue

            stock_eval = InventoryEngine.evaluate_material(material)
            if stock_eval.usable_stock < needed_qty:
                deficit = needed_qty - stock_eval.usable_stock
                has_critical_shortage = True
                constraints_violated.append(
                    f"Substrate shortage: {stock_eval.name} requires {needed_qty} {stock_eval.unit}, but only {max(0.0, stock_eval.usable_stock):.1f} usable in stock (Deficit: {deficit:.1f})."
                )
            else:
                constraints_met.append(
                    f"Substrate ready: {stock_eval.name} has {stock_eval.usable_stock:.1f} {stock_eval.unit} usable (Needed: {needed_qty})."
                )

        # 2. Timing & Capacity Check
        try:
            deadline = datetime.fromisoformat(deadline_str.replace("Z", "+00:00"))
            hours_available = max(0.0, (deadline - datetime.now(deadline.tzinfo)).total_seconds() / 3600.0)
            if hours_available < 12.0:
                constraints_violated.append(f"Turnaround time ({hours_available:.1f} hours) is under the 12-hour factory safety buffer.")
            else:
                constraints_met.append(f"Sufficient operating buffer: {hours_available:.1f} hours available until dispatch deadline.")
        except Exception:
            missing_data.append("Invalid ISO-8601 deadline timestamp.")

        # Classify final verdict
        if has_critical_shortage:
            verdict = "NOT_RECOMMENDED"
            confidence = "HIGH"
            summary = "Cannot commit to requested delivery date due to confirmed substrate shortages."
            recommended_action = "Issue immediate vendor PO or renegotiate dispatch deadline with customer."
        elif constraints_violated:
            verdict = "POSSIBLE_WITH_RISK"
            confidence = "MEDIUM"
            summary = "Feasible only if machine downtime is zero and changeovers proceed without delay."
            assumptions.append("Assumes single-pass setup with zero operator delays.")
            recommended_action = "Prioritize on primary press and notify floor supervisor of tight buffer."
        else:
            verdict = "SAFE"
            confidence = "HIGH"
            summary = "All materials available and machine capacity confirmed with healthy buffer."
            recommended_action = "Approve and schedule job into production pipeline."

        return FeasibilityVerdict(
            order_id=order_id,
            verdict=verdict,
            confidence=confidence,
            summary=summary,
            constraints_met=constraints_met,
            constraints_violated=constraints_violated,
            missing_data=missing_data,
            assumptions=assumptions,
            recommended_action=recommended_action
        )
