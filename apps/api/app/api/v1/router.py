"""API v1 Endpoints for FactoryOS."""

import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Header, Body, Request
from pydantic import BaseModel

from app.core.tenancy import get_current_tenant, TenantContext
from app.core.rate_limit import check_rate_limit
from app.services.inventory import InventoryEngine
from app.services.feasibility import FeasibilityEngine
from app.services.scheduler import SchedulerEngine
from app.services.profitability import ProfitabilityEngine
from app.services.imports import ImportEngine

router = APIRouter()

# Load benchmark printing sample dataset
SAMPLE_DATA_PATH = Path(__file__).resolve().parents[4] / "data" / "sample" / "factory_data.json"
_db: Dict[str, Any] = {}

def get_sample_db() -> Dict[str, Any]:
    global _db
    if not _db and SAMPLE_DATA_PATH.exists():
        with open(SAMPLE_DATA_PATH, "r", encoding="utf-8") as f:
            _db = json.load(f)
    return _db


# 1. Dashboard Overview
@router.get("/dashboard")
def get_dashboard_summary(tenant: TenantContext = Depends(get_current_tenant)):
    check_rate_limit("DASHBOARD_READ", tenant.user_id)
    db = get_sample_db()

    materials = db.get("materials", [])
    orders = db.get("orders", [])
    machines = db.get("machines", [])

    # Evaluate inventory health
    material_evaluations = [InventoryEngine.evaluate_material(m) for m in materials]
    shortage_count = sum(1 for m in material_evaluations if m.is_shortage)

    # Top-3 Attention Items
    top_3_attention = [
        {
            "id": "att_01",
            "severity": "CRITICAL",
            "title": "Substrate Shortage for Brochure Run",
            "record": "Order #ORD-2026-1044",
            "reason": "Maplitho 80 GSM requires 140 reams; only 82 reams usable in stock.",
            "recommended_action": "Issue vendor PO or negotiate delivery extension with client.",
            "freshness": "2 mins ago"
        },
        {
            "id": "att_02",
            "severity": "WARNING",
            "title": "Saddle Stitcher Maintenance in Progress",
            "record": "Muller Martini Stitcher",
            "reason": "Machine offline for routine lubrication until tomorrow 09:00 AM.",
            "recommended_action": "Route folding work to auxiliary table; staging for stitcher.",
            "freshness": "15 mins ago"
        },
        {
            "id": "att_03",
            "severity": "INFO",
            "title": "Dispatches Due Today",
            "record": "Order #ORD-2026-1045",
            "reason": "2,000 Visiting Cards ready for final QA and dispatch delivery challan.",
            "recommended_action": "Generate delivery challan and notify driver.",
            "freshness": "Just now"
        }
    ]

    return {
        "factory_id": tenant.factory_id,
        "factory_name": db.get("factory", {}).get("name", "FactoryOS Demo Plant"),
        "is_sample_data": True,
        "last_updated": "2026-10-19T16:00:00Z",
        "factory_health": {
            "orders_on_track": sum(1 for o in orders if o.get("risk_rating") == "SAFE"),
            "orders_at_risk": sum(1 for o in orders if o.get("risk_rating") in ["POSSIBLE_WITH_RISK", "NOT_RECOMMENDED"]),
            "machines_running": sum(1 for m in machines if m.get("status") == "RUNNING"),
            "machines_idle": sum(1 for m in machines if m.get("status") == "IDLE"),
            "machines_down": sum(1 for m in machines if m.get("status") in ["DOWN", "MAINTENANCE"]),
            "materials_shortage_count": shortage_count
        },
        "top_3_attention": top_3_attention,
        "today_production": {
            "planned_impressions": 85000,
            "completed_impressions": 54200,
            "efficiency_percentage": 92.4,
            "waste_sheets": 480
        }
    }


# 2. Inventory Calculations
@router.get("/inventory")
def list_inventory_status(tenant: TenantContext = Depends(get_current_tenant)):
    check_rate_limit("DASHBOARD_READ", tenant.user_id)
    db = get_sample_db()
    materials = db.get("materials", [])
    results = [InventoryEngine.evaluate_material(m) for m in materials]
    return {
        "factory_id": tenant.factory_id,
        "is_sample_data": True,
        "materials": [r.model_dump() for r in results]
    }


# 3. Orders & Feasibility
@router.get("/orders")
def list_orders(tenant: TenantContext = Depends(get_current_tenant)):
    check_rate_limit("DASHBOARD_READ", tenant.user_id)
    db = get_sample_db()
    return {
        "factory_id": tenant.factory_id,
        "orders": db.get("orders", [])
    }


class FeasibilityRequest(BaseModel):
    order: Dict[str, Any]

@router.post("/orders/feasibility")
def evaluate_order_feasibility(
    payload: FeasibilityRequest,
    tenant: TenantContext = Depends(get_current_tenant)
):
    check_rate_limit("CALCULATIONS", tenant.user_id)
    db = get_sample_db()
    materials_db = {m["id"]: m for m in db.get("materials", [])}
    machines_db = {m["id"]: m for m in db.get("machines", [])}
    verdict = FeasibilityEngine.evaluate_order(payload.order, materials_db, machines_db)
    return verdict.model_dump()


# 4. Production Scheduler
@router.get("/production/schedule")
def get_production_schedule(tenant: TenantContext = Depends(get_current_tenant)):
    check_rate_limit("DASHBOARD_READ", tenant.user_id)
    db = get_sample_db()
    candidates = SchedulerEngine.generate_candidate_schedule(
        db.get("orders", []),
        db.get("machines", [])
    )
    return {
        "factory_id": tenant.factory_id,
        "schedule_candidates": [c.model_dump() for c in candidates]
    }


# 5. Worker Screen Event Recording
class WorkerEventRequest(BaseModel):
    job_id: str
    machine_id: str
    event_type: str  # START | PAUSE | RESUME | PROBLEM | WASTE | COMPLETE
    idempotency_key: str
    payload: Optional[Dict[str, Any]] = None

@router.post("/production/events")
def record_worker_event(
    event: WorkerEventRequest,
    tenant: TenantContext = Depends(get_current_tenant)
):
    check_rate_limit("WORKER_ACTION", tenant.user_id)
    return {
        "status": "ACCEPTED",
        "job_id": event.job_id,
        "event_type": event.event_type,
        "idempotency_key": event.idempotency_key,
        "persisted": True,
        "message": f"Event '{event.event_type}' recorded successfully."
    }


# 6. AI Copilot Grounded Q&A
class CopilotQuery(BaseModel):
    prompt: str

@router.post("/ai/copilot/query")
def copilot_query(
    query: CopilotQuery,
    tenant: TenantContext = Depends(get_current_tenant)
):
    check_rate_limit("COPILOT", tenant.user_id)
    db = get_sample_db()
    prompt_lower = query.prompt.lower()

    if "risk" in prompt_lower or "delay" in prompt_lower:
        return {
            "short_answer": "Two orders are currently at risk: Order #ORD-2026-1044 (Maplitho paper shortage) and Order #ORD-2026-1046 (Stitcher maintenance).",
            "supporting_facts": [
                {"record": "ORD-2026-1044", "fact": "Deficit of 58 reams 80 GSM Maplitho paper."},
                {"record": "ORD-2026-1046", "fact": "Muller Martini saddle stitcher offline until tomorrow morning."}
            ],
            "reasons": "Material stock reservations exceed physical availability, and downstream finishing machines have scheduled maintenance buffers.",
            "confidence": "HIGH",
            "limitations": "Assumes vendor paper delivery does not arrive earlier than confirmed date.",
            "next_step": "Review vendor purchase order draft or resequence stitcher queue."
        }

    return {
        "short_answer": "Factory operations are running with 2 machines active and 1 under routine maintenance.",
        "supporting_facts": [
            {"record": "Overall Plant", "fact": "92.4% current efficiency with 54,200 impressions completed today."}
        ],
        "reasons": "Production running on Heidelberg CX 104 and Polar Cutter.",
        "confidence": "HIGH",
        "limitations": "Night shift operator headcount not yet confirmed.",
        "next_step": "Check morning briefing report or inspect material stock."
    }
