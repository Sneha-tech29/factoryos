"""Unit tests for FactoryOS Owner Authentication, Persistent Setup Wizard & Multi-Tenant Isolation."""

import sys
import unittest
import sqlite3
from pathlib import Path

# Add apps/api to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.database import get_db_connection
from app.services.auth_service import AuthService, hash_password, verify_password
from app.services.setup_service import SetupService
from app.services.imports import ImportEngine


class TestAuthAndSetupWizard(unittest.TestCase):
    def setUp(self):
        # Use an in-memory SQLite database for isolated test execution
        self.conn = sqlite3.connect(":memory:")
        self.conn.row_factory = sqlite3.Row
        from app.db.database import init_db_schema
        init_db_schema(self.conn)

    def tearDown(self):
        self.conn.close()

    def test_owner_registration_and_password_hashing(self):
        """Verify secure registration, password hashing (never plaintext), and session generation."""
        reg = AuthService.register_owner(
            self.conn,
            full_name="Rajiv Singhania",
            email="rajiv@singhaniaprint.in",
            password="SecurePassword2026!"
        )

        self.assertIn("usr_", reg["user_id"])
        self.assertIn("fac_", reg["factory_id"])
        self.assertEqual(reg["email"], "rajiv@singhaniaprint.in")
        self.assertFalse(reg["is_setup_complete"])

        # Verify password is NOT plaintext in database
        user = self.conn.execute("SELECT password_hash, salt FROM users WHERE id = ?", (reg["user_id"],)).fetchone()
        self.assertNotEqual(user["password_hash"], "SecurePassword2026!")
        self.assertEqual(len(user["password_hash"]), 128)  # 64 bytes hex = 128 chars
        self.assertTrue(verify_password("SecurePassword2026!", user["password_hash"], user["salt"]))

    def test_duplicate_registration_rejected(self):
        """Verify duplicate accounts with identical email are rejected."""
        AuthService.register_owner(self.conn, "User One", "owner@plant.com", "Password123!")
        with self.assertRaises(ValueError) as ctx:
            AuthService.register_owner(self.conn, "User Two", "owner@plant.com", "Password456!")
        self.assertIn("already exists", str(ctx.exception))

    def test_authentication_success_and_failure(self):
        """Verify login succeeds with correct credentials and fails with invalid passwords."""
        AuthService.register_owner(self.conn, "Sunil Gupta", "sunil@pack.com", "CorrectPassword123")

        # Success
        login = AuthService.authenticate_owner(self.conn, "sunil@pack.com", "CorrectPassword123")
        self.assertEqual(login["email"], "sunil@pack.com")
        self.assertIsNotNone(login["token"])

        # Wrong password
        with self.assertRaises(PermissionError):
            AuthService.authenticate_owner(self.conn, "sunil@pack.com", "WrongPassword")

        # Unknown email
        with self.assertRaises(PermissionError):
            AuthService.authenticate_owner(self.conn, "unknown@pack.com", "CorrectPassword123")

    def test_multi_tenant_isolation(self):
        """Verify Owner A cannot modify Owner B's factory or records (IDOR protection)."""
        owner_a = AuthService.register_owner(self.conn, "Owner A", "a@test.com", "Password123!")
        owner_b = AuthService.register_owner(self.conn, "Owner B", "b@test.com", "Password123!")

        # Owner A attempts to modify Owner B's factory
        with self.assertRaises(PermissionError):
            SetupService.save_step1(
                self.conn,
                factory_id=owner_b["factory_id"],
                owner_id=owner_a["user_id"],  # Mismatched owner!
                data={"factoryName": "Malicious Hijack"}
            )

        # Owner A attempts to add machine to Owner B's factory
        with self.assertRaises(PermissionError):
            SetupService.add_machine(
                self.conn,
                factory_id=owner_b["factory_id"],
                owner_id=owner_a["user_id"],
                machine={"name": "Rogue Press"}
            )

    def test_six_step_setup_wizard_lifecycle(self):
        """Verify the full 6-step setup workflow persists all relationships incrementally."""
        owner = AuthService.register_owner(self.conn, "Vikram Mehta", "vikram@mehtaprint.in", "StrongPass2026#")
        f_id = owner["factory_id"]
        u_id = owner["user_id"]

        # Step 1: Basic Information
        step1_res = SetupService.save_step1(
            self.conn, f_id, u_id,
            {
                "factoryName": "Mehta High-Precision Packaging",
                "city": "Ahmedabad",
                "state": "Gujarat",
                "floorAreaSqft": 25000,
                "employeesCount": 40
            }
        )
        self.assertEqual(step1_res["next_step"], 2)

        # Step 2: Industry & Processes
        step2_res = SetupService.save_step2(
            self.conn, f_id, u_id,
            {
                "primaryIndustry": "paper_pulp_packaging",
                "productCategories": ["Corrugated Boxes", "Duplex Cartons"],
                "manufacturingProcess": "Corrugation, Flexo Printing, Die-Cutting",
                "productionModel": "BATCH",
                "productionLinesCount": 3
            }
        )
        self.assertEqual(step2_res["next_step"], 3)

        # Step 3: Machines & Equipment
        mch_id = SetupService.add_machine(
            self.conn, f_id, u_id,
            {
                "name": "Heidelberg Speedmaster XL 106",
                "assetTag": "MCH-PR-01",
                "type": "OFFSET_PRESS",
                "ratedCapacity": 18000,
                "hourlyRateInr": 3500
            }
        )
        self.assertIn("mch_", mch_id)

        # Step 4: Raw Materials & Machine Relationships
        mat_id = SetupService.add_raw_material(
            self.conn, f_id, u_id,
            {
                "sku": "PAP-DPX-350",
                "name": "350 GSM Grey-Back Duplex Board",
                "category": "PAPER",
                "unit": "sheets",
                "physicalStock": 5000,
                "reorderThreshold": 1000,
                "assignedMachineIds": [mch_id]  # Linked to machine!
            }
        )
        self.assertIn("mat_", mat_id)

        # Verify mapping persisted
        mapping = self.conn.execute(
            "SELECT * FROM machine_material_mappings WHERE factory_id = ? AND machine_id = ? AND material_id = ?",
            (f_id, mch_id, mat_id)
        ).fetchone()
        self.assertIsNotNone(mapping)

        # Step 5: Workers & Assignments
        wrk_id = SetupService.add_worker(
            self.conn, f_id, u_id,
            {
                "fullName": "Suresh Patel",
                "employeeId": "EMP-301",
                "jobRole": "Senior Press Operator",
                "department": "Printing",
                "assignedShift": "MORNING",
                "machineAssignments": [{"machineId": mch_id, "role": "Primary Operator"}]
            }
        )
        self.assertIn("wrk_", wrk_id)

        # Verify assignment persisted
        assignment = self.conn.execute(
            "SELECT * FROM worker_machine_assignments WHERE factory_id = ? AND worker_id = ? AND machine_id = ?",
            (f_id, wrk_id, mch_id)
        ).fetchone()
        self.assertIsNotNone(assignment)
        self.assertEqual(assignment["role"], "Primary Operator")

        # Step 6: Complete Setup
        complete_res = SetupService.complete_setup(self.conn, f_id, u_id)
        self.assertEqual(complete_res["status"], "COMPLETED")

        # Verify factory is marked complete
        factory = self.conn.execute("SELECT is_setup_complete, current_setup_step FROM factories WHERE id = ?", (f_id,)).fetchone()
        self.assertEqual(factory["is_setup_complete"], 1)
        self.assertEqual(factory["current_setup_step"], 6)

    def test_import_formula_injection_guard(self):
        """Verify spreadsheet cells starting with '=', '+', '-', '@' are sanitized."""
        malicious_val = "=cmd|'/c calc'!A0"
        sanitized = ImportEngine.sanitize_cell_value(malicious_val)
        self.assertTrue(sanitized.startswith("'="))
        self.assertNotIn("=cmd", sanitized[:4])

        # Test batch validation
        rows = [
            {"sku": "SKU-01", "name": "Safe Art Paper", "physical_stock": "100"},
            {"sku": "SKU-02", "name": "=SUM(A1:A10)", "physical_stock": "-50"}  # Invalid negative stock
        ]
        result = ImportEngine.validate_materials_batch(rows)
        self.assertEqual(result.valid_rows_count, 1)
        self.assertEqual(result.invalid_rows_count, 1)
        self.assertEqual(result.errors[0].field, "physical_stock")


if __name__ == "__main__":
    unittest.main()
