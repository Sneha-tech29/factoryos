"""Deterministic inventory mathematics conforming to Rules.md §2."""

from typing import Dict, Any, List, Optional
from app.core.compat import BaseModel


class StockCalculationResult(BaseModel):
    material_id: str
    sku: str
    name: str
    unit: str
    physical_stock: float
    reserved_stock: float
    damaged_stock: float
    usable_stock: float
    projected_available: float
    is_shortage: bool
    warning_message: Optional[str] = None


class InventoryEngine:
    @staticmethod
    def calculate_usable_stock(
        physical_stock: float,
        reserved_stock: float,
        damaged_stock: float
    ) -> float:
        """
        Canonical Formula:
        Usable Stock = Physical Stock − Reserved Stock − Damaged/Unusable Stock
        """
        return physical_stock - reserved_stock - damaged_stock

    @staticmethod
    def calculate_projected_available(
        usable_stock: float,
        confirmed_incoming: float = 0.0,
        expected_consumption: float = 0.0
    ) -> float:
        """
        Canonical Formula:
        Projected Available = Usable Stock + Confirmed Incoming − Expected Consumption
        """
        return usable_stock + confirmed_incoming - expected_consumption

    @classmethod
    def evaluate_material(
        cls,
        material: Dict[str, Any],
        confirmed_incoming: float = 0.0,
        expected_consumption: float = 0.0
    ) -> StockCalculationResult:
        physical = float(material.get("physical_stock", 0))
        reserved = float(material.get("reserved_stock", 0))
        damaged = float(material.get("damaged_stock", 0))
        reorder_threshold = float(material.get("reorder_threshold", 0))

        usable = cls.calculate_usable_stock(physical, reserved, damaged)
        projected = cls.calculate_projected_available(usable, confirmed_incoming, expected_consumption)

        is_shortage = usable < 0 or projected < reorder_threshold
        warning = None
        if usable < 0:
            warning = f"CRITICAL SHORTAGE: Usable stock is negative ({usable:.1f} {material.get('unit')}). Reserved stock exceeds physical availability."
        elif projected < reorder_threshold:
            warning = f"REORDER WARNING: Projected available ({projected:.1f}) is below reorder threshold ({reorder_threshold:.1f})."

        return StockCalculationResult(
            material_id=material.get("id", ""),
            sku=material.get("sku", ""),
            name=material.get("name", ""),
            unit=material.get("unit", ""),
            physical_stock=physical,
            reserved_stock=reserved,
            damaged_stock=damaged,
            usable_stock=usable,
            projected_available=projected,
            is_shortage=is_shortage,
            warning_message=warning
        )
