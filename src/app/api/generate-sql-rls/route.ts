import { NextResponse } from "next/server";
import { parseDBML } from "@/lib/dbml";
import { generateSqlAndRls } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = body?.input ?? "";
    const apiKey = typeof body?.apiKey === "string" ? body.apiKey : undefined;
    const model = typeof body?.model === "string" ? body.model : undefined;

    let parsed = body?.parsed;
    if (!parsed && typeof input === "string" && input.trim()) {
      parsed = parseDBML(input);
    }

    if (!parsed) {
      return NextResponse.json({ error: "DBML input or parsed schema is required." }, { status: 400 });
    }

    const result = await generateSqlAndRls({ parsed, apiKey, model, dbml: typeof input === "string" ? input : undefined });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
