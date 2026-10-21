"""Factory setup wizard persistence and multi-tenant management service."""

import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional


class SetupService:
    @staticmethod
    def save_step1(conn, factory_id: str, owner_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Saves Step 1: Basic Information."""
        name = data.get("factoryName", "").strip()
        if not name:
            raise ValueError("Factory name is required.")

        now = datetime.now(timezone.utc).isoformat()
        cursor = conn.cursor()

        # Enforce tenant isolation
        cursor.execute("""
            UPDATE factories
            SET
              name = ?,
              registration_id = ?,
              address = ?,
              city = ?,
              state = ?,
              country = ?,
              postal_code = ?,
              floor_area_sqft = ?,
              establishment_year = ?,
              employees_count = ?,
              timezone = ?,
              primary_contact_name = ?,
              primary_contact_email = ?,
              primary_contact_phone = ?,
              current_setup_step = MAX(current_setup_step, 2),
              updated_at = ?
            WHERE id = ? AND owner_id = ?
        """, (
            name,
            data.get("registrationId"),
            data.get("address"),
            data.get("city"),
            data.get("state"),
            data.get("country", "India"),
            data.get("postalCode"),
            data.get("floorAreaSqft"),
            data.get("establishmentYear"),
            data.get("employeesCount"),
            data.get("timezone", "Asia/Kolkata"),
            data.get("primaryContactName"),
            data.get("primaryContactEmail"),
            data.get("primaryContactPhone"),
            now,
            factory_id,
            owner_id
        ))

        if cursor.rowcount == 0:
            raise PermissionError("Factory not found or unauthorized.")

        conn.commit()
        return {"status": "SUCCESS", "step": 1, "next_step": 2}

    @staticmethod
    def save_step2(conn, factory_id: str, owner_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Saves Step 2: Industry & Processes."""
        industry = data.get("primaryIndustry")
        if not industry:
            raise ValueError("Primary Industry is required.")

        now = datetime.now(timezone.utc).isoformat()
        cursor = conn.cursor()

        product_categories_json = json.dumps(data.get("productCategories", []))

        cursor.execute("""
            UPDATE factories
            SET
              industry = ?,
              industry_custom = ?,
              product_categories = ?,
              manufacturing_process = ?,
              production_model = ?,
              production_lines_count = ?,
              current_setup_step = MAX(current_setup_step, 3),
              updated_at = ?
            WHERE id = ? AND owner_id = ?
        """, (
            industry,
            data.get("customIndustry"),
            product_categories_json,
            data.get("manufacturingProcess"),
            data.get("productionModel", "BATCH"),
            data.get("productionLinesCount", 1),
            now,
            factory_id,
            owner_id
        ))

        if cursor.rowcount == 0:
            raise PermissionError("Factory not found or unauthorized.")

        conn.commit()
        return {"status": "SUCCESS", "step": 2, "next_step": 3}

    @staticmethod
    def add_machine(conn, factory_id: str, owner_id: str, machine: Dict[str, Any]) -> str:
        """Saves Step 3: Machine record."""
        name = machine.get("name", "").strip()
        if not name:
            raise ValueError("Machine name is required.")

        # Verify tenant
        cursor = conn.cursor()
        f = cursor.execute("SELECT id FROM factories WHERE id = ? AND owner_id = ?", (factory_id, owner_id)).fetchone()
        if not f:
            raise PermissionError("Unauthorized.")

        machine_id = machine.get("id") or f"mch_{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()

        cursor.execute("""
            INSERT INTO machines (
                id, factory_id, name, asset_tag, type, manufacturer, model, serial_number,
                quantity, department, rated_capacity, capacity_unit, hourly_rate_inr,
                status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                asset_tag = excluded.asset_tag,
                type = excluded.type,
                rated_capacity = excluded.rated_capacity,
                hourly_rate_inr = excluded.hourly_rate_inr,
                updated_at = excluded.updated_at
        """, (
            machine_id,
            factory_id,
            name,
            machine.get("assetTag"),
            machine.get("type", "GENERAL"),
            machine.get("manufacturer"),
            machine.get("model"),
            machine.get("serialNumber"),
            machine.get("quantity", 1),
            machine.get("department", "Main Plant"),
            machine.get("ratedCapacity", 0),
            machine.get("capacityUnit", "units/hr"),
            machine.get("hourlyRateInr", 0),
            machine.get("status", "OPERATIONAL"),
            now,
            now
        ))

        cursor.execute("""
            UPDATE factories SET current_setup_step = MAX(current_setup_step, 4), updated_at = ?
            WHERE id = ?
        """, (now, factory_id))

        conn.commit()
        return machine_id

    @staticmethod
    def add_raw_material(conn, factory_id: str, owner_id: str, material: Dict[str, Any]) -> str:
        """Saves Step 4: Raw Material and machine mappings."""
        name = material.get("name", "").strip()
        sku = material.get("sku", "").strip()
        if not name or not sku:
            raise ValueError("Material name and SKU are required.")

        cursor = conn.cursor()
        f = cursor.execute("SELECT id FROM factories WHERE id = ? AND owner_id = ?", (factory_id, owner_id)).fetchone()
        if not f:
            raise PermissionError("Unauthorized.")

        material_id = material.get("id") or f"mat_{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()

        cursor.execute("""
            INSERT INTO raw_materials (
                id, factory_id, sku, name, category, unit, physical_stock,
                reorder_threshold, unit_cost_inr, supplier_name, storage_location,
                is_hazardous, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                physical_stock = excluded.physical_stock,
                reorder_threshold = excluded.reorder_threshold,
                updated_at = excluded.updated_at
        """, (
            material_id,
            factory_id,
            sku,
            name,
            material.get("category", "GENERAL"),
            material.get("unit", "units"),
            material.get("physicalStock", 0),
            material.get("reorderThreshold", 0),
            material.get("unitCostInr", 0),
            material.get("supplierName"),
            material.get("storageLocation"),
            1 if material.get("isHazardous") else 0,
            now,
            now
        ))

        # Save machine mappings
        assigned_machines = material.get("assignedMachineIds", [])
        cursor.execute("DELETE FROM machine_material_mappings WHERE factory_id = ? AND material_id = ?", (factory_id, material_id))
        for m_id in assigned_machines:
            map_id = f"map_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO machine_material_mappings (id, factory_id, machine_id, material_id, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, (map_id, factory_id, m_id, material_id, now))

        cursor.execute("""
            UPDATE factories SET current_setup_step = MAX(current_setup_step, 5), updated_at = ?
            WHERE id = ?
        """, (now, factory_id))

        conn.commit()
        return material_id

    @staticmethod
    def add_worker(conn, factory_id: str, owner_id: str, worker: Dict[str, Any]) -> str:
        """Saves Step 5: Worker profile and machine assignments."""
        name = worker.get("fullName", "").strip()
        if not name:
            raise ValueError("Worker full name is required.")

        cursor = conn.cursor()
        f = cursor.execute("SELECT id FROM factories WHERE id = ? AND owner_id = ?", (factory_id, owner_id)).fetchone()
        if not f:
            raise PermissionError("Unauthorized.")

        worker_id = worker.get("id") or f"wrk_{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()

        cursor.execute("""
            INSERT INTO workers (
                id, factory_id, employee_id, full_name, department, job_role,
                contact_number, assigned_shift, employment_status, date_joined,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                full_name = excluded.full_name,
                job_role = excluded.job_role,
                department = excluded.department,
                assigned_shift = excluded.assigned_shift,
                updated_at = excluded.updated_at
        """, (
            worker_id,
            factory_id,
            worker.get("employeeId"),
            name,
            worker.get("department", "Production Floor"),
            worker.get("jobRole", "Operator"),
            worker.get("contactNumber"),
            worker.get("assignedShift", "MORNING"),
            worker.get("employmentStatus", "ACTIVE"),
            worker.get("dateJoined"),
            now,
            now
        ))

        # Assignments
        assignments = worker.get("machineAssignments", [])
        cursor.execute("DELETE FROM worker_machine_assignments WHERE factory_id = ? AND worker_id = ?", (factory_id, worker_id))
        for asgn in assignments:
            m_id = asgn.get("machineId")
            if m_id:
                asgn_id = f"asgn_{uuid.uuid4().hex[:8]}"
                cursor.execute("""
                    INSERT INTO worker_machine_assignments (
                        id, factory_id, worker_id, machine_id, role, shift, start_date, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    asgn_id,
                    factory_id,
                    worker_id,
                    m_id,
                    asgn.get("role", "Operator"),
                    asgn.get("shift", "MORNING"),
                    asgn.get("startDate", now.split("T")[0]),
                    now
                ))

        cursor.execute("""
            UPDATE factories SET current_setup_step = MAX(current_setup_step, 6), updated_at = ?
            WHERE id = ?
        """, (now, factory_id))

        conn.commit()
        return worker_id

    @staticmethod
    def complete_setup(conn, factory_id: str, owner_id: str) -> Dict[str, Any]:
        """Finalizes Step 6: Marks setup completed."""
        now = datetime.now(timezone.utc).isoformat()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE factories
            SET is_setup_complete = 1, current_setup_step = 6, updated_at = ?
            WHERE id = ? AND owner_id = ?
        """, (now, factory_id, owner_id))

        if cursor.rowcount == 0:
            raise PermissionError("Unauthorized or factory not found.")

        cursor.execute("""
            UPDATE setup_progress
            SET current_step = 6, completed_steps = '[1,2,3,4,5,6]', updated_at = ?
            WHERE factory_id = ?
        """, (now, factory_id))

        conn.commit()
        return {"status": "COMPLETED", "factory_id": factory_id}
