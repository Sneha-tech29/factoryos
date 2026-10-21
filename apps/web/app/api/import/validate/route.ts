import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import {
  parseSpreadsheetBuffer,
  validateImportBatch,
  ImportCategory,
  TEMPLATE_SCHEMAS,
} from "@/lib/importEngine";

export async function POST(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as ImportCategory) || "materials";

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!TEMPLATE_SCHEMAS[category]) {
      return NextResponse.json(
        { error: `Invalid import category '${category}'.` },
        { status: 400 }
      );
    }

    // Max 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds maximum size limit of 10MB." },
        { status: 400 }
      );
    }

    const validExtensions = [".csv", ".xlsx", ".xls"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file format '${ext}'. Please upload .csv or .xlsx.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { columns, rows } = parseSpreadsheetBuffer(buffer, file.name);
    const validation = validateImportBatch(category, rows);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      category,
      totalRows: validation.totalRows,
      validRowsCount: validation.validRowsCount,
      invalidRowsCount: validation.invalidRowsCount,
      errors: validation.errors,
      previewRows: validation.previewRows,
      detectedColumns: validation.detectedColumns,
      suggestedMapping: validation.suggestedMapping,
      allValidRows: validation.validRowsCount > 0 ? validation.validRowsCount : 0,
    });
  } catch (err: unknown) {
    console.error("Import validation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to parse and validate file." },
      { status: 500 }
    );
  }
}
