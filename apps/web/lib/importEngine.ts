import * as XLSX from "xlsx";

export type ImportCategory = "factory" | "machines" | "materials" | "workers" | "assignments";

export interface RowError {
  rowNumber: number;
  field: string;
  error: string;
  rawValue: unknown;
}

export interface ValidationResult {
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  errors: RowError[];
  previewRows: Record<string, unknown>[];
  detectedColumns: string[];
  suggestedMapping: Record<string, string>;
}

export const TEMPLATE_SCHEMAS: Record<
  ImportCategory,
  {
    fileName: string;
    description: string;
    columns: string[];
    sampleData: Record<string, unknown>[];
  }
> = {
  machines: {
    fileName: "factoryos_machines_template",
    description: "Factory Machines and Production Equipment",
    columns: [
      "Machine Name",
      "Asset Tag",
      "Type",
      "Manufacturer",
      "Model",
      "Serial Number",
      "Quantity",
      "Department",
      "Rated Capacity",
      "Capacity Unit",
      "Hourly Rate (INR)",
      "Status",
    ],
    sampleData: [
      {
        "Machine Name": "Heidelberg Speedmaster CX 104",
        "Asset Tag": "MCH-PR-01",
        Type: "OFFSET_PRESS",
        Manufacturer: "Heidelberg",
        Model: "CX 104",
        "Serial Number": "SN-2024-9981",
        Quantity: 1,
        Department: "Offset Printing",
        "Rated Capacity": 12000,
        "Capacity Unit": "sheets/hr",
        "Hourly Rate (INR)": 2800,
        Status: "OPERATIONAL",
      },
      {
        "Machine Name": "Polar 115 High-Speed Guillotine",
        "Asset Tag": "MCH-CT-02",
        Type: "GUILLOTINE_CUTTER",
        Manufacturer: "Polar",
        Model: "115 ED",
        "Serial Number": "SN-2023-1120",
        Quantity: 1,
        Department: "Finishing & Cutting",
        "Rated Capacity": 2500,
        "Capacity Unit": "cuts/hr",
        "Hourly Rate (INR)": 900,
        Status: "OPERATIONAL",
      },
    ],
  },
  materials: {
    fileName: "factoryos_materials_template",
    description: "Raw Materials and Inventory Stock",
    columns: [
      "SKU",
      "Material Name",
      "Category",
      "Unit of Measure",
      "Physical Stock",
      "Reorder Threshold",
      "Unit Cost (INR)",
      "Supplier Name",
      "Storage Location",
      "Batch Number",
      "Is Hazardous",
    ],
    sampleData: [
      {
        SKU: "PAP-AC-300",
        "Material Name": "300 GSM Royal Coated Art Card",
        Category: "PAPER",
        "Unit of Measure": "reams",
        "Physical Stock": 140,
        "Reorder Threshold": 30,
        "Unit Cost (INR)": 3200,
        "Supplier Name": "Ballarpur Paper Mills",
        "Storage Location": "Bay 1 - Paper Storage",
        "Batch Number": "LOT-2026-B1",
        "Is Hazardous": "NO",
      },
      {
        SKU: "INK-CMYK-SET",
        "Material Name": "Process Offset Cyan Ink",
        Category: "INK",
        "Unit of Measure": "kg",
        "Physical Stock": 80,
        "Reorder Threshold": 20,
        "Unit Cost (INR)": 450,
        "Supplier Name": "Hubergroup India",
        "Storage Location": "Bay 3 - Ink Chemical Room",
        "Batch Number": "LOT-CYAN-44",
        "Is Hazardous": "NO",
      },
    ],
  },
  workers: {
    fileName: "factoryos_workers_template",
    description: "Factory Floor Workers and Supervisors",
    columns: [
      "Employee ID",
      "Worker Name",
      "Department",
      "Job Role",
      "Contact Number",
      "Assigned Shift",
      "Employment Status",
      "Date Joined",
    ],
    sampleData: [
      {
        "Employee ID": "EMP-101",
        "Worker Name": "Rajesh Kumar",
        Department: "Offset Printing",
        "Job Role": "Lead Press Operator",
        "Contact Number": "+91 98110 00001",
        "Assigned Shift": "MORNING",
        "Employment Status": "ACTIVE",
        "Date Joined": "2021-04-15",
      },
      {
        "Employee ID": "EMP-102",
        "Worker Name": "Sunil Verma",
        Department: "Finishing & Cutting",
        "Job Role": "Guillotine Technician",
        "Contact Number": "+91 98110 00002",
        "Assigned Shift": "EVENING",
        "Employment Status": "ACTIVE",
        "Date Joined": "2022-08-01",
      },
    ],
  },
  assignments: {
    fileName: "factoryos_assignments_template",
    description: "Worker to Machine Assignments",
    columns: [
      "Worker Employee ID",
      "Machine Asset Tag",
      "Assignment Role",
      "Shift",
      "Start Date",
      "Status",
    ],
    sampleData: [
      {
        "Worker Employee ID": "EMP-101",
        "Machine Asset Tag": "MCH-PR-01",
        "Assignment Role": "Primary Operator",
        Shift: "MORNING",
        "Start Date": "2026-01-01",
        Status: "ACTIVE",
      },
    ],
  },
  factory: {
    fileName: "factoryos_factory_info_template",
    description: "Factory Information and Facilities",
    columns: [
      "Factory Name",
      "Registration ID",
      "Address",
      "City",
      "State",
      "Country",
      "Postal Code",
      "Primary Contact Name",
      "Primary Contact Email",
      "Primary Contact Phone",
    ],
    sampleData: [
      {
        "Factory Name": "Apex Print & Pack Solutions",
        "Registration ID": "REG-DEL-2024-001",
        Address: "Plot 42, Okhla Industrial Area Phase II",
        City: "New Delhi",
        State: "Delhi",
        Country: "India",
        "Postal Code": "110020",
        "Primary Contact Name": "Vikas Sharma",
        "Primary Contact Email": "vikas@apexprint.in",
        "Primary Contact Phone": "+91 98110 12345",
      },
    ],
  },
};

/**
 * Escapes formula injection in cell contents
 */
export function sanitizeCellValue(val: unknown): unknown {
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("=") || trimmed.startsWith("+") || trimmed.startsWith("-") || trimmed.startsWith("@")) {
      return `'${trimmed}`;
    }
    return trimmed;
  }
  return val;
}

/**
 * Parses buffer into array of rows
 */
export function parseSpreadsheetBuffer(
  buffer: Buffer,
  fileName: string
): { columns: string[]; rows: Record<string, unknown>[] } {
  const isCsv = fileName.toLowerCase().endsWith(".csv");
  const workbook = isCsv
    ? XLSX.read(buffer.toString("utf8"), { type: "string" })
    : XLSX.read(buffer, { type: "buffer" });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("Spreadsheet does not contain any readable sheets.");
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: "",
    raw: false,
  });

  if (rawRows.length === 0) {
    throw new Error("Spreadsheet sheet is empty.");
  }

  const columns = Object.keys(rawRows[0] || {}).filter(
    (col) => !["__proto__", "constructor", "prototype"].includes(col.trim().toLowerCase())
  );

  const sanitizedRows = rawRows.map((row) => {
    const sanitized: Record<string, unknown> = Object.create(null);
    for (const [k, v] of Object.entries(row)) {
      const cleanKey = k.trim();
      const lowerKey = cleanKey.toLowerCase();
      if (lowerKey === "__proto__" || lowerKey === "constructor" || lowerKey === "prototype") {
        continue;
      }
      sanitized[cleanKey] = sanitizeCellValue(v);
    }
    return sanitized;
  });

  return { columns, rows: sanitizedRows };
}

/**
 * Validates rows for a specific category
 */
export function validateImportBatch(
  category: ImportCategory,
  rows: Record<string, unknown>[]
): ValidationResult {
  const errors: RowError[] = [];
  const validRows: Record<string, unknown>[] = [];
  const detectedColumns = rows.length > 0 ? Object.keys(rows[0]) : [];
  const suggestedMapping: Record<string, string> = {};

  const findCol = (row: Record<string, unknown>, aliases: string[]): unknown => {
    for (const alias of aliases) {
      for (const key of Object.keys(row)) {
        if (key.toLowerCase().replace(/[^a-z0-9]/g, "") === alias.toLowerCase().replace(/[^a-z0-9]/g, "")) {
          suggestedMapping[key] = aliases[0];
          return row[key];
        }
      }
    }
    return undefined;
  };

  rows.forEach((row, index) => {
    const rowNum = index + 2; // Row 1 is header
    let rowHasError = false;
    const cleanRow: Record<string, unknown> = {};

    if (category === "machines") {
      const name = findCol(row, ["Machine Name", "name", "machine_name", "Equipment"]);
      const tag = findCol(row, ["Asset Tag", "asset_tag", "Tag", "ID"]);
      const type = findCol(row, ["Type", "machine_type", "Category"]);
      const qty = findCol(row, ["Quantity", "qty", "Units"]);
      const speed = findCol(row, ["Rated Capacity", "speed", "Speed"]);
      const rate = findCol(row, ["Hourly Rate (INR)", "rate", "hourly_rate"]);

      if (!name || String(name).trim().length < 2) {
        errors.push({
          rowNumber: rowNum,
          field: "Machine Name",
          error: "Machine Name is required (minimum 2 characters).",
          rawValue: name,
        });
        rowHasError = true;
      }

      const parsedQty = Number(qty) || 1;
      if (parsedQty <= 0) {
        errors.push({
          rowNumber: rowNum,
          field: "Quantity",
          error: "Quantity must be greater than 0.",
          rawValue: qty,
        });
        rowHasError = true;
      }

      cleanRow.name = String(name || "").trim();
      cleanRow.assetTag = tag ? String(tag).trim() : null;
      cleanRow.type = type ? String(type).trim().toUpperCase() : "GENERAL";
      cleanRow.manufacturer = findCol(row, ["Manufacturer", "Make", "brand"]) || null;
      cleanRow.model = findCol(row, ["Model", "model_number"]) || null;
      cleanRow.serialNumber = findCol(row, ["Serial Number", "serial_no"]) || null;
      cleanRow.quantity = parsedQty;
      cleanRow.department = findCol(row, ["Department", "dept", "Line"]) || "Main Plant";
      cleanRow.ratedCapacity = Number(speed) || 0;
      cleanRow.capacityUnit = findCol(row, ["Capacity Unit", "unit"]) || "units/hr";
      cleanRow.hourlyRateInr = Number(rate) || 0;
      cleanRow.status = findCol(row, ["Status"]) || "OPERATIONAL";
    } else if (category === "materials") {
      const name = findCol(row, ["Material Name", "name", "description", "Item Name"]);
      const sku = findCol(row, ["SKU", "Item Code", "code", "material_code"]);
      const cat = findCol(row, ["Category", "category"]);
      const unit = findCol(row, ["Unit of Measure", "unit", "uom"]);
      const stock = findCol(row, ["Physical Stock", "stock", "quantity", "current_stock"]);
      const threshold = findCol(row, ["Reorder Threshold", "threshold", "min_stock"]);
      const cost = findCol(row, ["Unit Cost (INR)", "unit_cost", "cost", "price"]);

      if (!name || String(name).trim().length < 2) {
        errors.push({
          rowNumber: rowNum,
          field: "Material Name",
          error: "Material Name is required.",
          rawValue: name,
        });
        rowHasError = true;
      }

      if (!sku || String(sku).trim().length < 1) {
        errors.push({
          rowNumber: rowNum,
          field: "SKU",
          error: "SKU / Material Code is required.",
          rawValue: sku,
        });
        rowHasError = true;
      }

      const parsedStock = Number(stock ?? 0);
      if (isNaN(parsedStock) || parsedStock < 0) {
        errors.push({
          rowNumber: rowNum,
          field: "Physical Stock",
          error: "Physical stock must be a non-negative number.",
          rawValue: stock,
        });
        rowHasError = true;
      }

      cleanRow.sku = String(sku || "").trim();
      cleanRow.name = String(name || "").trim();
      cleanRow.category = cat ? String(cat).trim().toUpperCase() : "GENERAL";
      cleanRow.unit = unit ? String(unit).trim() : "units";
      cleanRow.physicalStock = isNaN(parsedStock) ? 0 : parsedStock;
      cleanRow.reorderThreshold = Number(threshold) || 0;
      cleanRow.unitCostInr = Number(cost) || 0;
      cleanRow.supplierName = findCol(row, ["Supplier Name", "vendor", "Supplier"]) || null;
      cleanRow.storageLocation = findCol(row, ["Storage Location", "location", "bay"]) || null;
      cleanRow.batchNumber = findCol(row, ["Batch Number", "batch", "lot"]) || null;
      const haz = findCol(row, ["Is Hazardous", "hazardous", "hazard"]);
      cleanRow.isHazardous =
        haz && ["yes", "true", "1", "y"].includes(String(haz).trim().toLowerCase()) ? 1 : 0;
    } else if (category === "workers") {
      const name = findCol(row, ["Worker Name", "name", "Full Name"]);
      const empId = findCol(row, ["Employee ID", "emp_id", "id", "badge"]);
      const dept = findCol(row, ["Department", "dept"]);
      const role = findCol(row, ["Job Role", "role", "designation"]);

      if (!name || String(name).trim().length < 2) {
        errors.push({
          rowNumber: rowNum,
          field: "Worker Name",
          error: "Worker Name is required.",
          rawValue: name,
        });
        rowHasError = true;
      }

      cleanRow.fullName = String(name || "").trim();
      cleanRow.employeeId = empId ? String(empId).trim() : null;
      cleanRow.department = dept ? String(dept).trim() : "Production Floor";
      cleanRow.jobRole = role ? String(role).trim() : "Operator";
      cleanRow.contactNumber = findCol(row, ["Contact Number", "phone", "mobile"]) || null;
      cleanRow.assignedShift = findCol(row, ["Assigned Shift", "shift"]) || "MORNING";
      cleanRow.employmentStatus = findCol(row, ["Employment Status", "status"]) || "ACTIVE";
      cleanRow.dateJoined = findCol(row, ["Date Joined", "joining_date"]) || null;
    } else if (category === "assignments") {
      const empId = findCol(row, ["Worker Employee ID", "Employee ID", "worker_id"]);
      const tag = findCol(row, ["Machine Asset Tag", "Asset Tag", "machine_id"]);
      const role = findCol(row, ["Assignment Role", "Role"]);

      if (!empId) {
        errors.push({
          rowNumber: rowNum,
          field: "Worker Employee ID",
          error: "Worker Employee ID is required to match assignment.",
          rawValue: empId,
        });
        rowHasError = true;
      }

      if (!tag) {
        errors.push({
          rowNumber: rowNum,
          field: "Machine Asset Tag",
          error: "Machine Asset Tag is required to match assignment.",
          rawValue: tag,
        });
        rowHasError = true;
      }

      cleanRow.workerEmployeeId = String(empId || "").trim();
      cleanRow.machineAssetTag = String(tag || "").trim();
      cleanRow.role = role ? String(role).trim() : "Operator";
      cleanRow.shift = findCol(row, ["Shift", "assigned_shift"]) || "MORNING";
      cleanRow.startDate = findCol(row, ["Start Date", "date"]) || new Date().toISOString().split("T")[0];
    } else if (category === "factory") {
      const name = findCol(row, ["Factory Name", "name", "Plant Name"]);
      if (!name || String(name).trim().length < 2) {
        errors.push({
          rowNumber: rowNum,
          field: "Factory Name",
          error: "Factory Name is required.",
          rawValue: name,
        });
        rowHasError = true;
      }
      cleanRow.factoryName = String(name || "").trim();
      cleanRow.registrationId = findCol(row, ["Registration ID", "reg_no"]) || null;
      cleanRow.address = findCol(row, ["Address", "location"]) || null;
      cleanRow.city = findCol(row, ["City"]) || null;
      cleanRow.state = findCol(row, ["State"]) || null;
      cleanRow.country = findCol(row, ["Country"]) || "India";
      cleanRow.postalCode = findCol(row, ["Postal Code", "pincode", "zip"]) || null;
      cleanRow.primaryContactName = findCol(row, ["Primary Contact Name", "Contact Person"]) || null;
      cleanRow.primaryContactEmail = findCol(row, ["Primary Contact Email", "Email"]) || null;
      cleanRow.primaryContactPhone = findCol(row, ["Primary Contact Phone", "Phone"]) || null;
    }

    if (!rowHasError) {
      validRows.push(cleanRow);
    }
  });

  return {
    totalRows: rows.length,
    validRowsCount: validRows.length,
    invalidRowsCount: errors.length,
    errors,
    previewRows: validRows.slice(0, 5),
    detectedColumns,
    suggestedMapping,
  };
}
