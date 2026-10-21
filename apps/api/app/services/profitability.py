"""Deterministic Profitability & Contribution Margin Engine conforming to Rules.md §2."""

from typing import Dict, Any, List, Optional
from app.core.compat import BaseModel


class ProfitabilitySnapshot(BaseModel):
    order_id: str
    revenue_inr: float
    direct_materials_cost_inr: float
    direct_machine_cost_inr: float
    total_included_costs_inr: float
    estimated_contribution_inr: Optional[float]
    margin_percent: Optional[float]
    cost_completeness: str  # COMPLETE | PARTIAL | INSUFFICIENT
    warning_or_notes: Optional[str]


class ProfitabilityEngine:
    @staticmethod
    def calculate_job_profitability(
        order: Dict[str, Any],
        materials_db: Dict[str, Dict[str, Any]],
        estimated_machine_hours: float = 3.5,
        machine_hourly_rate: float = 2800.0
    ) -> ProfitabilitySnapshot:
        revenue = float(order.get("agreed_price_inr", 0))
        required_materials = order.get("required_materials", [])

        if revenue <= 0:
            return ProfitabilitySnapshot(
                order_id=order.get("id", ""),
                revenue_inr=0.0,
                direct_materials_cost_inr=0.0,
                direct_machine_cost_inr=0.0,
                total_included_costs_inr=0.0,
                estimated_contribution_inr=None,
                margin_percent=None,
                cost_completeness="INSUFFICIENT",
                warning_or_notes="Revenue is zero or unrecorded. Cannot compute contribution margin."
            )

        materials_cost = 0.0
        missing_costs = False

        for req in required_materials:
            mat_id = req.get("material_id")
            qty = req.get("quantity", 0)
            material = materials_db.get(mat_id)
            if material and "unit_cost_inr" in material:
                materials_cost += qty * float(material["unit_cost_inr"])
            else:
                missing_costs = True

        machine_cost = estimated_machine_hours * machine_hourly_rate
        total_costs = materials_cost + machine_cost

        # Canonical Formula: Estimated Contribution = Revenue − Included Direct/Allocated Costs
        contribution = revenue - total_costs
        # Margin % = Estimated Contribution ÷ Revenue × 100
        margin_pct = (contribution / revenue) * 100.0

        completeness = "PARTIAL" if missing_costs else "COMPLETE"
        note = "Some substrate cost rates were unrecorded; estimate is partial." if missing_costs else "Verified direct production costs."

        return ProfitabilitySnapshot(
            order_id=order.get("id", ""),
            revenue_inr=revenue,
            direct_materials_cost_inr=materials_cost,
            direct_machine_cost_inr=machine_cost,
            total_included_costs_inr=total_costs,
            estimated_contribution_inr=contribution,
            margin_percent=round(margin_pct, 1),
            cost_completeness=completeness,
            warning_or_notes=note
        )
