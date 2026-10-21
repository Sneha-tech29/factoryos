import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { TEMPLATE_SCHEMAS, ImportCategory } from "@/lib/importEngine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get("category") || "materials") as ImportCategory;
    const format = (searchParams.get("format") || "csv").toLowerCase();

    const schema = TEMPLATE_SCHEMAS[category];
    if (!schema) {
      return NextResponse.json(
        { error: `Unknown template category: '${category}'.` },
        { status: 400 }
      );
    }

    // Build worksheet from sample data
    const ws = XLSX.utils.json_to_sheet(schema.sampleData, {
      header: schema.columns,
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    if (format === "xlsx") {
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${schema.fileName}.xlsx"`,
        },
      });
    }

    // Default to CSV
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${schema.fileName}.csv"`,
      },
    });
  } catch (err: unknown) {
    console.error("Template download error:", err);
    return NextResponse.json({ error: "Failed to generate template." }, { status: 500 });
  }
}
