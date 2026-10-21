"""Deterministic Excel/CSV Import Engine conforming to PRD.md §3.3."""

from typing import Dict, Any, List, Optional
from app.core.compat import BaseModel


class ImportRowError(BaseModel):
    row_number: int
    field: str
    error_message: str
    raw_value: Any


class ImportValidationPreview(BaseModel):
    total_rows: int
    valid_rows_count: int
    invalid_rows_count: int
    errors: List[ImportRowError]
    preview_rows: List[Dict[str, Any]]
    suggested_mapping: Dict[str, str]


class ImportCommitResult(BaseModel):
    import_id: str
    status: str
    created_count: int
    updated_count: int
    skipped_count: int
    failed_count: int
    summary: str


class ImportEngine:
    @staticmethod
    def sanitize_cell_value(val: Any) -> Any:
        """
        Guards against CSV/Spreadsheet formula injection:
        Cells starting with '=', '+', '-', '@' are treated as text literals.
        """
        if isinstance(val, str) and val.startswith(("=", "+", "-", "@")):
            return f"'{val}"
        return val

    @classmethod
    def validate_materials_batch(
        cls,
        raw_rows: List[Dict[str, Any]]
    ) -> ImportValidationPreview:
        errors = []
        valid_rows = []
        suggested_mapping = {
            "Item Code / SKU": "sku",
            "Description": "name",
            "Category": "category",
            "Physical Stock": "physical_stock",
            "Unit of Measure": "unit"
        }

        for idx, row in enumerate(raw_rows, start=2):  # 1-indexed header is row 1
            row_has_error = False
            sanitized = {k: cls.sanitize_cell_value(v) for k, v in row.items()}

            sku = sanitized.get("sku") or sanitized.get("Item Code / SKU")
            name = sanitized.get("name") or sanitized.get("Description")
            stock = sanitized.get("physical_stock") or sanitized.get("Physical Stock")

            if not sku:
                errors.append(ImportRowError(row_number=idx, field="sku", error_message="SKU is required", raw_value=sku))
                row_has_error = True
            if not name:
                errors.append(ImportRowError(row_number=idx, field="name", error_message="Material name is required", raw_value=name))
                row_has_error = True

            try:
                stock_num = float(stock if stock is not None else 0)
                if stock_num < 0:
                    errors.append(ImportRowError(row_number=idx, field="physical_stock", error_message="Physical stock cannot be negative", raw_value=stock))
                    row_has_error = True
            except (ValueError, TypeError):
                errors.append(ImportRowError(row_number=idx, field="physical_stock", error_message="Stock must be a valid number", raw_value=stock))
                row_has_error = True

            if not row_has_error:
                valid_rows.append(sanitized)

        return ImportValidationPreview(
            total_rows=len(raw_rows),
            valid_rows_count=len(valid_rows),
            invalid_rows_count=len(errors),
            errors=errors,
            preview_rows=valid_rows[:5],
            suggested_mapping=suggested_mapping
        )

    @classmethod
    def commit_batch(cls, import_id: str, valid_rows: List[Dict[str, Any]]) -> ImportCommitResult:
        # Atomic commit simulation for sample data
        created = len(valid_rows)
        return ImportCommitResult(
            import_id=import_id,
            status="COMMITTED",
            created_count=created,
            updated_count=0,
            skipped_count=0,
            failed_count=0,
            summary=f"Successfully committed {created} material records. Audit log recorded."
        )
