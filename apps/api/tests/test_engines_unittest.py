"""Standard library unittest suite for FactoryOS Deterministic Engines."""

import sys
from pathlib import Path
import unittest

# Add app to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.inventory import InventoryEngine
from app.services.feasibility import FeasibilityEngine
from app.services.profitability import ProfitabilityEngine
from app.core.rate_limit import check_rate_limit, FactoryOSError


class TestDeterministicEngines(unittest.TestCase):
    def test_usable_stock_formula(self):
        """Usable Stock = Physical Stock − Reserved Stock − Damaged/Unusable Stock"""
        usable = InventoryEngine.calculate_usable_stock(100.0, 25.0, 5.0)
        self.assertEqual(usable, 70.0)

    def test_projected_available_formula(self):
        """Projected Available = Usable Stock + Confirmed Incoming − Expected Consumption"""
        projected = InventoryEngine.calculate_projected_available(70.0, 30.0, 20.0)
        self.assertEqual(projected, 80.0)

    def test_negative_usable_stock_triggers_shortage(self):
        sample_mat = {
            "id": "mat_test",
            "name": "Test Art Card",
            "unit": "REAMS",
            "physical_stock": 50,
            "reserved_stock": 60,
            "damaged_stock": 2,
            "reorder_threshold": 10
        }
        res = InventoryEngine.evaluate_material(sample_mat)
        self.assertEqual(res.usable_stock, -12.0)
        self.assertTrue(res.is_shortage)
        self.assertIn("CRITICAL SHORTAGE", res.warning_message)

    def test_feasibility_missing_specs(self):
        res = FeasibilityEngine.evaluate_order({}, {}, {})
        self.assertEqual(res.verdict, "CANNOT_ASSESS")
        self.assertEqual(res.confidence, "LOW")

    def test_contribution_margin(self):
        order = {
            "id": "ord_test",
            "agreed_price_inr": 100000.0,
            "required_materials": [{"material_id": "mat_1", "quantity": 10}]
        }
        materials_db = {"mat_1": {"unit_cost_inr": 4000.0}}
        snapshot = ProfitabilityEngine.calculate_job_profitability(order, materials_db)
        self.assertEqual(snapshot.revenue_inr, 100000.0)
        self.assertEqual(snapshot.total_included_costs_inr, 49800.0)
        self.assertEqual(snapshot.estimated_contribution_inr, 50200.0)
        self.assertEqual(snapshot.margin_percent, 50.2)
        self.assertEqual(snapshot.cost_completeness, "COMPLETE")

    def test_rate_limiter_exceeded(self):
        identity = "usr_tester_rapid_unittest"
        with self.assertRaises(FactoryOSError) as ctx:
            for _ in range(15):
                check_rate_limit("AGENT", identity)
        self.assertEqual(ctx.exception.code, "RATE_LIMITED")
        self.assertEqual(ctx.exception.status_code, 429)


if __name__ == "__main__":
    unittest.main()
