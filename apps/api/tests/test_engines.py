"""Unit tests for FactoryOS Deterministic Engines conforming to Rules.md."""

import pytest
from app.services.inventory import InventoryEngine
from app.services.feasibility import FeasibilityEngine
from app.services.profitability import ProfitabilityEngine
from app.core.rate_limit import check_rate_limit, FactoryOSError


def test_inventory_usable_stock_formula():
    """Usable Stock = Physical Stock − Reserved Stock − Damaged/Unusable Stock"""
    usable = InventoryEngine.calculate_usable_stock(physical_stock=100.0, reserved_stock=25.0, damaged_stock=5.0)
    assert usable == 70.0


def test_inventory_projected_available_formula():
    """Projected Available = Usable Stock + Confirmed Incoming − Expected Consumption"""
    projected = InventoryEngine.calculate_projected_available(usable_stock=70.0, confirmed_incoming=30.0, expected_consumption=20.0)
    assert projected == 80.0


def test_inventory_shortage_detection():
    sample_mat = {
        "id": "mat_test",
        "name": "Test Art Card",
        "unit": "REAMS",
        "physical_stock": 50,
        "reserved_stock": 60,  # Reserved > physical => negative usable!
        "damaged_stock": 2,
        "reorder_threshold": 10
    }
    result = InventoryEngine.evaluate_material(sample_mat)
    assert result.usable_stock == -12.0
    assert result.is_shortage is True
    assert "CRITICAL SHORTAGE" in result.warning_message


def test_feasibility_cannot_assess_when_missing():
    result = FeasibilityEngine.evaluate_order({}, {}, {})
    assert result.verdict == "CANNOT_ASSESS"
    assert result.confidence == "LOW"


def test_profitability_contribution_margin_formula():
    """
    Estimated Contribution = Revenue − Included Direct Costs
    Margin % = (Contribution ÷ Revenue) * 100
    """
    order = {
        "id": "ord_test",
        "agreed_price_inr": 100000.0,
        "required_materials": [{"material_id": "mat_1", "quantity": 10}]
    }
    materials_db = {"mat_1": {"unit_cost_inr": 4000.0}}
    # Material cost: 10 * 4000 = 40,000. Machine: 3.5 hrs * 2800 = 9,800. Total = 49,800.
    # Contribution = 100,000 - 49,800 = 50,200. Margin = 50.2%
    snapshot = ProfitabilityEngine.calculate_job_profitability(order, materials_db)
    assert snapshot.revenue_inr == 100000.0
    assert snapshot.total_included_costs_inr == 49800.0
    assert snapshot.estimated_contribution_inr == 50200.0
    assert snapshot.margin_percent == 50.2
    assert snapshot.cost_completeness == "COMPLETE"


def test_rate_limiter_exceeded():
    identity = "usr_tester_rapid"
    with pytest.raises(FactoryOSError) as excinfo:
        for _ in range(12):
            check_rate_limit("AGENT", identity)
    assert excinfo.value.code == "RATE_LIMITED"
    assert excinfo.value.status_code == 429
