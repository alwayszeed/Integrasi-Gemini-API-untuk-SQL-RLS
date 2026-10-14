import { NextResponse } from "next/server";
import { parseDBML } from "@/lib/dbml";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = typeof body?.input === "string" ? body.input : "";
    if (!input.trim()) {
      return NextResponse.json({ error: "input is required" }, { status: 400 });
    }
    const result = parseDBML(input);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
